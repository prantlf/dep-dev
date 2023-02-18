import { join, resolve } from 'path'
import picomatch from 'picomatch'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import loadConfig from '../../../src/load-config.js'
import listDeps from '../../../src/list-deps.js'
import spawnProcess from '../../../src/spawn-process.js'
import resolveDeps from '../../../src/resolve-deps.js'
import upgradeDeps from './upgrade-deps.js'
import isPattern from './is-pattern.js'

// Collects peer dependencies from the specified packages and traverses them
// recursively to collect peer dependencies of the collected packages etc.
async function deepDeps(root, pending, visited = new Set()) {
  await Promise.all(pending.map(async dep => {
    const pkg = `${root}/node_modules/${dep}/package.json`
    let { peerDependencies = {} } = await readJSON(pkg)
    peerDependencies = Object.keys(peerDependencies)
    if (peerDependencies.length) {
      for (const dep of peerDependencies) visited.add(dep)
      await deepDeps(root, peerDependencies, visited)
    }
  }))
  return visited
}

// Enables upgrading the specified dependencies and upgrades them
// to the latest compatible semver version.
export async function upgradeDependencies(newDeps, { config, cwd, deep, save, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // if no deps were specified, install all deps from the config file
  let deps = newDeps, root
  if (!(deps && deps.length)) {
    if (config) {
      if (config === true) {
        root = await findRoot(cwd)
        config = join(root, 'package-updates.json')
      } else {
        config = resolve(config)
      }
      deps = await readJSON(config)
    } else {
      root = await findRoot(cwd)
      deps = await loadConfig('updates', root)
    }
    deps = deps.updateDependencies
  }
  if (!(deps && deps.length)) {
    return console.log('no dependencies to update')
  }

  // traverse peer dependencies
  if (!root) root = await findRoot(cwd)
  let { dependencies = {}, devDependencies = {} } = await readJSON(join(root, 'package.json'))
  dependencies = Object.keys(dependencies)
  const peers = deep && deps.some(isPattern) ? await deepDeps(root, dependencies) : []
  dependencies = new Set([...dependencies, ...peers, ...Object.keys(devDependencies)])

  // resolve wildcards
  deps = deps.reduce((result, pattern) => {
    if (isPattern(pattern)) {
      const match = picomatch(pattern)
      let updated
      for (const dep of dependencies) {
        if (match(dep)) {
          result.push(dep)
          updated = true
        }
      }
      if (!updated) throw new Error(`no dependency matched ${pattern}`)
    } else {
      result.push(pattern)
    }
    return result
  }, [])

  // collect all arguments for the npm execution
  const args = ['up', '--no-save', '--no-package-lock', '--no-audit', '--no-update-notifier']
  if (progress === undefined) progress = !('npm_config_progress' in process.env)
  if (!progress) args.push('--no-progress')
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'
  if (verbose) args.push('--verbose')
  args.push(...deps);

  // update the deps using `npm i --no-save --no-package-lock ...`
  if (verbose) console.log(`> npm ${args.join(' ')}`)
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    // simulate the npm output
    const duration = Math.trunc(performance.now() - start)
    const suffix = deps.length > 1 ? 's' : ''
    console.log(`\nupdated ${deps.length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps)
    return
  }
  await spawnProcess('npm', args, { cwd })

  // get and print the versions of the updated deps
  deps = await resolveDeps(deps, root)
  if (list) listDeps(deps)

  // save the newly added deps to the config file
  if (save !== false && newDeps && newDeps.length) {
    await upgradeDeps(newDeps, config, root, lineBreak)
  }
}
