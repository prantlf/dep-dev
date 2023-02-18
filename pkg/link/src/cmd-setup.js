import { join, resolve  } from 'path'
import { readFile, writeFile } from 'fs/promises'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import writeJSON from '../../../src/write-json.js'
import installTool from '../../../src/install-tool.js'
import { shorten } from '../../../src/log.js'
import log from './log.js'

// Prepares package.json and other configuration files to automate linking
// of selected dependencies using this package.
export async function setupLinkDependencies({ config, cwd, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // find the preferred configuration file and the sibling .gitignore
  const root = await findRoot(cwd, verbose)
  const pkg = join(root, 'package.json')
  if (config === true || config === undefined) config = join(root, 'package-links.json')
  else if (!config) config = pkg
  else config = resolve(config)
  const same = config === pkg
  const git = join(root, '.gitignore')
  if (verbose) log(`expecting configuration in "${shorten(config)}"`)
  if (verbose) log(`expecting .gitignore in "${shorten(root)}"`)

  // load all package.json, the configuration file if separate and .gitignore
  const readDeps = async () => {
    try {
      return await readJSON(config, verbose)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      if (verbose) log(`"${shorten(config)}" not found`)
    }
  }
  const readIgnore = async () => {
    try {
      if (verbose) log(`reading "${shorten(git)}"`)
      return await readFile(git, 'utf8')
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      if (verbose) log(`"${shorten(git)}" not found`)
    }
  }
  let [proj, deps, ignore] = await Promise.all([
    readJSON(pkg, verbose), same || readDeps(), readIgnore()
  ])
  if (same) deps = proj

  // make sure that the configuration file contains the dependency list
  let saveDeps
  if (!deps) {
    deps = {}
    saveDeps = true
  } else if (!deps.linkDependencies) {
    deps.linkDependencies = {}
    saveDeps = true
  }
  if (saveDeps && verbose) log(`creating empty configuration`)

  // automate the linking in the npm prepare phase as the second step
  let saveProj
  const { scripts, dependencies, devDependencies } = proj
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
  if (saveProj && verbose) log(`setting scripts.prepare to "${proj.scripts.prepare}"`)

  // ensure the separate link configuration file in .gitignore
  let saveIgnore
  if (!same && !(ignore && /\bpackage-links.json\b/g.test(ignore))) {
    if (ignore === undefined) ignore = ''
    else if (!ignore.endsWith('\n')) ignore += '\n'
    ignore += 'package-links.json\n'
    saveIgnore = true
  }
  if (saveIgnore && verbose) log(`appending package-links.json to "${shorten(git)}"`)

  // write changes to package.json separate configuration file and .gitignore
  const writeConfigAndProj = async () => {
    if (same) {
      if (saveDeps || saveProj) await writeJSON(config, deps, lineBreak, verbose)
    } else {
      await Promise.all([
        saveDeps && await writeJSON(config, deps, lineBreak, verbose),
        saveProj && await writeJSON(pkg, proj, lineBreak, verbose)
      ])
    }
  }
  const writeGit = async () => {
    if (saveIgnore) {
      if (verbose) log(`writing "${shorten(git)}"`)
      await writeFile(git, ignore)
    }
  }
  if (!dryRun) await Promise.all([writeConfigAndProj(), writeGit()])

  // add this package to development dependencies
  if (!(dependencies && dependencies['@pkgdep/link'] ||
      devDependencies && devDependencies['@pkgdep/link'])) {
    await installTool('@pkgdep/link', root, list, progress, verbose, dryRun, start)
  }
}
