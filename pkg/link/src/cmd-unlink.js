import listDeps from '../../../src/list-deps.js'
import findRoot from '../../../src/find-root.js'
import destroyLinks from './destroy-links.js'
import unlinkDeps from './unlink-deps.js'

export async function unlinkDependencies(deps, { config, cwd, save, lineBreak, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // if no deps were specified, bail out
  if (!(deps && deps.length)) {
    return console.log('no extra dependencies to unlink')
  }

  // unlink the deps
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\nunlinked ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps, true)
    return
  }
  const root = await findRoot(cwd)
  await destroyLinks(deps, root, verbose);

  // get and print unlinked deps
  if (list) listDeps(deps, true)

  // remove the unlinked deps from the config file
  if (save !== false) {
    const root = await findRoot(cwd)
    await unlinkDeps(deps, config, root, lineBreak)
  }
}
