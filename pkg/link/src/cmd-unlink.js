import listDeps from '../../../src/list-deps.js'
import findRoot from '../../../src/find-root.js'
import destroyLinks from './destroy-links.js'
import unlinkDeps from './unlink-deps.js'

// Stops linking the specified dependencies to directories in the local file
// system, and removes the links right away.
export async function unlinkDependencies(deps, { config, cwd, save, lineBreak, list, verbose, dryRun } = {}) {
  const start = performance.now()
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'

  // if no deps were specified, bail out
  if (!(deps && deps.length)) {
    return console.log('no extra dependencies to unlink')
  }
  if (verbose) log(`unlinking dependencies: ${deps.join(', ')}`)

  // unlink the deps
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    // simulate the output of the unlinking script
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\nunlinked ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps, true)
    return
  }
  const root = await findRoot(cwd, verbose)
  await destroyLinks(deps, root, verbose);

  // get and print unlinked deps
  if (list) listDeps(deps, true)

  // remove the unlinked deps from the config file
  if (save !== false) {
    const root = await findRoot(cwd, verbose)
    await unlinkDeps(deps, config, root, lineBreak, verbose)
  }
}
