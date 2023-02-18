import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import findRoot from '../../../src/find-root.js'
import removeDeps from './remove-deps.js'
import log from './log.js'

// Stops installing the extra specified dependencies and uninstalls them
// right away.
export async function uninstallExtraDependencies(deps, { config, cwd, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'

  // if no deps were specified, bail out
  if (!(deps && deps.length)) {
    return console.log('no extra dependencies to uninstall')
  }
  if (verbose) log(`uninstalling dependencies: ${deps.join(', ')}`)

  // collect all arguments for the npm execution
  const args = ['r', '--no-save', '--no-package-lock', '--no-audit', '--no-update-notifier']
  if (progress === undefined) progress = !('npm_config_progress' in process.env)
  if (!progress) args.push('--no-progress')
  if (verbose) args.push('--verbose')
  args.push(...deps);

  // uninstall the extra deps using `npm r --no-save ...`
  if (verbose) console.log(`> npm ${args.join(' ')}`)
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    // simulate the npm output
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\nremoved ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps)
    return
  }
  await spawnProcess('npm', args, { cwd })

  // get and print uninstalled extra deps
  if (list) listDeps(deps)

  // remove the uninstalled deps from the config file
  if (save !== false) {
    const root = await findRoot(cwd, verbose)
    await removeDeps(deps, config, root, lineBreak, verbose)
  }
}
