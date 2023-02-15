import { join, resolve } from 'path'
import getPkg from '../../../src/get-pkg.js'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import resolveDeps from '../../../src/resolve-deps.js'
import writeJSON from '../../../src/write-json.js'

export async function setupExtraDependencies({ config, cwd, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  const root = await findRoot(cwd)
  const pkg = join(root, 'package.json')
  if (config === true) config = join(root, 'package-extras.json')
  else if (!config) config = pkg
  else config = resolve(config)
  const same = config === pkg

  const proj = await readJSON(pkg)
  let deps
  if (same) {
    deps = proj
  } else {
    try {
      deps = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  let saveDeps
  if (!deps) {
    deps = {}
    saveDeps = true
  } else if (!deps.extraDependencies) {
    deps.extraDependencies = {}
    saveDeps = true
  }

  let saveProj
  let { scripts, dependencies, devDependencies } = proj
  if (!scripts) {
    proj.scripts = { prepare: 'dep-extra i' }
    saveProj = true
  } else {
    const { prepare } = scripts
    if (!prepare) {
      scripts.prepare = 'dep-extra i'
      saveProj = true
    } else if (!/\bdep-extra\b/.test(prepare)) {
      scripts.prepare = `dep-extra i && ${prepare}`
      saveProj = true
    }
  }

  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (!dryRun) {
    if (same) {
      if (saveDeps || saveProj) await writeJSON(config, deps, lineBreak)
    } else {
      await Promise.all([
        saveDeps && await writeJSON(config, deps, lineBreak),
        saveProj && await writeJSON(pkg, proj, lineBreak)
      ])
    }
  }

  if (!(dependencies && dependencies['@pkgdep/extra'] ||
    devDependencies && devDependencies['@pkgdep/extra'])) {
    if (!devDependencies) devDependencies = proj.devDependencies = {}

    const args = ['i', '-D']
    if (progress === undefined) progress = !('npm_config_progress' in process.env)
    if (!progress) args.push('--no-progress')
    if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'
    if (verbose) args.push('--verbose')
    args.push('@pkgdep/extra');
  
    if (verbose) console.log(`> npm ${args.join(' ')}`)
    if (list === undefined) list = process.env.npm_config_list !== ''
    if (dryRun) {
      const duration = Math.trunc(performance.now() - start)
      console.log(`\nadded 1 package in ${duration}ms`)
      if (list) {
        const { version } = await getPkg()
        listDeps({ '@pkgdep/extra': version })
      }
    } else {
      await spawnProcess('npm', args, { cwd })
      if (list) {
        const { '@pkgdep/extra': version } = await resolveDeps(['@pkgdep/extra'], root)
        listDeps({ '@pkgdep/extra': version })
      }
    }
  }
}