import { join } from 'path'
import listDeps from '../../../src/list-deps.js'
import readJSON from '../../../src/read-json.js'
import spawnProcess from '../../../src/spawn-process.js'
import findRoot from '../../../src/find-root.js'
import downgradeDeps from './downgrade-deps.js'

export async function downgradeDependencies(depNames, { config, cwd, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // if no deps were specified, bail out
  if (!(depNames && depNames.length)) {
    return console.log('no dependencies to downgrade')
  }

  // append the version specifiers
  const root = await findRoot(cwd)
  const { packages } = await readJSON(join(root, 'package-lock.json'))
  const deps = depNames.map(dep => {
    const pkg = packages[`node_modules/${dep}`]
    if (!pkg) throw new Error(`unknown dependency: "${dep}`)
    return `${dep}@${pkg.version}`
  })

  // collect all arguments for the npm execution
  const args = ['i', '--no-save', '--no-package-lock', '--no-audit', '--no-update-notifier']
  if (progress === undefined) progress = !('npm_config_progress' in process.env)
  if (!progress) args.push('--no-progress')
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'
  if (verbose) args.push('--verbose')
  args.push(...deps);

  // uninstall the extra deps using `npm r --no-save ...`
  if (verbose) console.log(`> npm ${args.join(' ')}`)
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\ndowngraded ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps)
    return
  }
  await spawnProcess('npm', args, { cwd })

  // get and print downgraded deps
  if (list) listDeps(deps)

  // remove the downgraded deps from the config file
  if (save !== false) {
    await downgradeDeps(depNames, config, root, lineBreak)
  }
}
