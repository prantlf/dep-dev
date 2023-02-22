import { join } from 'path'
import picomatch from 'picomatch'
import listDeps from '../../../src/list-deps.js'
import readJSON from '../../../src/read-json.js'
import spawnProcess from '../../../src/spawn-process.js'
import findRoot from '../../../src/find-root.js'
import downgradeDeps from './downgrade-deps.js'
import isPattern from './is-pattern.js'
import log from './log.js'

// Stops upgrading the specified dependencies and downgrades them
// to the version set in the package lock.
export async function downgradeDependencies(depNames, { config, cwd, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'

  // if no deps were specified, bail out
  if (!(depNames && depNames.length)) {
    return console.log('no dependencies to downgrade')
  }

  // append the version specifiers from the package lock to dependency names
  const root = await findRoot(cwd, verbose)
  const { packages } = await readJSON(join(root, 'package-lock.json'), verbose)
  const deps = depNames.reduce((result, pattern) => {
    if (isPattern(pattern)) {
      if (verbose) log(`looking for dependencies matching ${pattern}`)
      const match = picomatch(pattern)
      let updated
      for (const key in packages) {
        if (key.startsWith('node_modules/')) {
          const name = key.substring(13)
          if (match(name)) {
            const pkg = packages[key]
            const dep = `${name}@${pkg.version}`
            if (verbose) log(`dependency ${dep} matched`)
            result.push(dep)
            updated = true
          }
        }
      }
      if (!updated) throw new Error(`no dependency matched ${pattern}`)
    } else {
      const pkg = packages[`node_modules/${pattern}`]
      if (!pkg) throw new Error(`unknown dependency: "${pattern}`)
      const dep = `${pattern}@${pkg.version}`
      if (verbose) log(`dependency ${dep} found`)
      result.push(dep)
    }
    return result
  }, [])

  // collect all arguments for the npm execution
  const args = ['i', '--no-save', '--no-audit', '--no-update-notifier']
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
    console.log(`\ndowngraded ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps)
    return
  }
  await spawnProcess('npm', args, { cwd })

  // get and print downgraded deps
  if (list) listDeps(deps)

  // remove the downgraded deps from the config file
  if (save !== false) {
    await downgradeDeps(depNames, config, root, lineBreak, verbose)
  }
}
