import { join, resolve } from 'path'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import loadConfig from '../../../src/load-config.js'
import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import resolveDeps from '../../../src/resolve-deps.js'
import addDeps from './add-deps.js'
import log from './log.js'

// Enables installing the extra specified dependencies and performs
// the installation right away.
export async function installExtraDependencies(newDeps, { config, cwd, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'

  // if no deps were specified, install all deps from the config file
  let deps = newDeps, root
  if (!(deps && deps.length)) {
    if (config) {
      if (config === true) {
        root = await findRoot(cwd, verbose)
        config = join(root, 'package-extras.json')
      } else {
        config = resolve(config)
      }
      deps = await readJSON(config, verbose)
    } else {
      root = await findRoot(cwd, verbose)
      deps = await loadConfig('extras', root, verbose)
    }
    deps = deps.extraDependencies
  }
  if (deps) {
    if (!Array.isArray(deps)) {
      deps = Object.keys(deps).map(name => `${name}@${deps[name]}`)
    } else if (verbose) {
      log(`requested to install: ${deps.join(', ')}`)
    }
  }
  if (!(deps && deps.length)) {
    return console.log('no extra dependencies to install')
  }

  // collect all arguments for the npm execution
  const args = ['i', '--no-save', '--no-audit', '--no-update-notifier']
  if (progress === undefined) progress = !('npm_config_progress' in process.env)
  if (!progress) args.push('--no-progress')
  if (verbose) args.push('--verbose')
  // add only dependencies which exact versions are missing in node_modules
  if (!root) root = await findRoot(cwd, verbose)
  const detectedDeps = await resolveDeps(deps, root, false, verbose)
  const depsToInstall = deps.filter(dep => {
    const versionIndex = dep.indexOf('@', 1)
    let name, version
    if (versionIndex > 0) {
      name = dep.slice(0, versionIndex)
      version = dep.slice(versionIndex + 1)
    } else {
      name = dep
    }
    // either the package was not found or its exact version different
    return !(version && version === detectedDeps[name])
  })

  // only if some packages to ninstall were found
  if (depsToInstall.length) {
    log(`actually installing: ${depsToInstall.join(', ')}`)
    args.push(...depsToInstall);

    // install the extra deps using `npm i --no-save ...`
    if (verbose) console.log(`> npm ${args.join(' ')}`)
    if (list === undefined) list = process.env.npm_config_list !== ''
    if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
    if (dryRun) {
      // simulate the npm output
      const duration = Math.trunc(performance.now() - start)
      const suffix = depsToInstall.length > 1 ? 's' : ''
      console.log(`\nadded ${depsToInstall.length} package${suffix} in ${duration}ms`)
      if (list) listDeps(depsToInstall)
      return
    }
    await spawnProcess('npm', args, { cwd })

    // get and print the versions of the installed extra deps
    deps = await resolveDeps(depsToInstall, root, true, verbose)
    if (list) listDeps(deps)

    // save the newly added deps to the config file
    if (save !== false && newDeps && newDeps.length) {
      await addDeps(newDeps, deps, config, root, lineBreak, verbose)
    }
  } else {
    log('nothing to actually install')
  }
}
