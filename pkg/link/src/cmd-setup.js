import { join, resolve  } from 'path'
import { readFile, writeFile } from 'fs/promises'
import getPkg from '../../../src/get-pkg.js'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import resolveDeps from '../../../src/resolve-deps.js'
import writeJSON from '../../../src/write-json.js'

export async function setupLinkDependencies({ config, cwd, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  const root = await findRoot(cwd)
  const pkg = join(root, 'package.json')
  if (config === true || config === undefined) config = join(root, 'package-links.json')
  else if (!config) config = pkg
  else config = resolve(config)
  const same = config === pkg
  const git = join(root, '.gitignore')

  const readDeps = async () => {
    try {
      return await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }
  const readIgnore = async () => {
    try {
      return await readFile(git, 'utf8')
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }
  let [proj, deps, ignore] = await Promise.all([
    readJSON(pkg), same || readDeps(), readIgnore()
  ])
  if (same) deps = proj

  let saveDeps
  if (!deps) {
    deps = {}
    saveDeps = true
  } else if (!deps.linkDependencies) {
    deps.linkDependencies = {}
    saveDeps = true
  }

  let saveProj
  let { scripts, dependencies, devDependencies } = proj
  if (!scripts) {
    proj.scripts = { prepare: 'dep-link ln' }
    saveProj = true
  } else {
    const { prepare } = scripts
    if (!prepare) {
      scripts.prepare = 'dep-link ln'
      saveProj = true
    } else if (!/\bdep-link\b/.test(prepare)) {
      if (/\bdep-extra\b/.test(prepare)) {
        scripts.prepare = prepare.replace(/\b(dep-extra[^&;]+)\b/, '$1 && dep-link ln')
      } else if (/\bdep-update\b/.test(prepare)) {
        scripts.prepare = prepare.replace(/\b(dep-update[^&;]+)\b/, '$1 && dep-link ln')
      } else {
        scripts.prepare = `dep-link ln && ${prepare}`
      }
    }
    saveProj = true
  }

  let saveIgnore
  if (!same && !(ignore && /\bpackage-links.json\b/g.test(ignore))) {
    if (ignore === undefined) ignore = ''
    else if (!ignore.endsWith('\n')) ignore += '\n'
    ignore += 'package-links.json\n'
    saveIgnore = true
  }

  const writeConfigAndProj = async () => {
    if (same) {
      if (saveDeps || saveProj) await writeJSON(config, deps, lineBreak)
    } else {
      await Promise.all([
        saveDeps && await writeJSON(config, deps, lineBreak),
        saveProj && await writeJSON(pkg, proj, lineBreak)
      ])
    }
  }
  const writeGit = async () => {
    if (saveIgnore) await writeFile(git, ignore)
  }
  if (!dryRun) await Promise.all([writeConfigAndProj(), writeGit()])

  if (!(dependencies && dependencies['@pkgdep/link'] ||
    devDependencies && devDependencies['@pkgdep/link'])) {
    if (!devDependencies) devDependencies = proj.devDependencies = {}

    const args = ['i', '-D']
    if (progress === false) args.push('--no-progress')
    if (verbose) args.push('--verbose')
    args.push('@pkgdep/link');
  
    if (verbose) console.log(`> npm ${args.join(' ')}`)
    if (dryRun) {
      const duration = Math.trunc(performance.now() - start)
      console.log(`\nadded 1 package in ${duration}ms`)
      if (list !== false) {
        const { version } = await getPkg()
        listDeps({ '@pkgdep/link': version })
      }
    } else {
      await spawnProcess('npm', args, { cwd })
      if (list !== false) {
        const { '@pkgdep/link': version } = await resolveDeps(['@pkgdep/link'], root)
        listDeps({ '@pkgdep/link': version })
      }
    }
  }
}
