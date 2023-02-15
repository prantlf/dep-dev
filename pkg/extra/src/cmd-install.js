import { join, resolve } from 'path'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import loadConfig from '../../../src/load-config.js'
import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import resolveDeps from '../../../src/resolve-deps.js'
import addDeps from './add-deps.js'

export async function installExtraDependencies(newDeps, { config, cwd, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // if no deps were specified, install all deps from the config file
  let deps = newDeps, root
  if (!(deps && deps.length)) {
    if (config) {
      if (config === true) {
        root = await findRoot(cwd)
        config = join(root, 'package-extras.json')
      } else {
        config = resolve(config)
      }
      deps = await readJSON(config)
    } else {
      root = await findRoot(cwd)
      deps = await loadConfig('extras', root)
    }
    deps = deps.extraDependencies
  }
  if (deps && !Array.isArray(deps)) {
    deps = Object.keys(deps).map(name => `${name}@${deps[name]}`)
  }
  if (!(deps && deps.length)) {
    return console.log('no extra dependencies to install')
  }

  // collect all arguments for the npm execution
  const args = ['i', '--no-save', '--no-package-lock', '--no-audit', '--no-update-notifier']
  if (progress === undefined) progress = !('npm_config_progress' in process.env)
  if (!progress) args.push('--no-progress')
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'
  if (verbose) args.push('--verbose')
  args.push(...deps);

  // install the extra deps using `npm i --no-save ...`
  if (verbose) console.log(`> npm ${args.join(' ')}`)
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\nadded ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps)
    return
  }
  await spawnProcess('npm', args, { cwd })

  // get and print the versions of the installed extra deps
  if (!root) root = await findRoot(cwd)
  deps = await resolveDeps(deps, root)
  if (list) listDeps(deps)

  // save the newly added deps to the config file
  if (save !== false && newDeps && newDeps.length) {
    await addDeps(newDeps, deps, config, root, lineBreak)
  }
}