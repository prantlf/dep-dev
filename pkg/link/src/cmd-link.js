import { join, resolve } from 'path'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import loadConfig from '../../../src/load-config.js'
import inspectDeps from './inspect-deps.js'
import createLinks from './create-links.js'
import listDeps from '../../../src/list-deps.js'
import linkDeps from './link-deps.js'
import { shorten } from '../../../src/log.js'
import log from './log.js'

// Enables linking the specified dependencies to directories in the local file
// system and creates the links right away.
export async function linkDependencies(newDeps, { config, cwd, junctions, save, lineBreak, list, verbose, dryRun } = {}) {
  const start = performance.now()
  if (verbose === undefined) verbose = process.env.npm_config_loglevel === 'verbose'

  // if no deps were specified, install all deps from the config file
  let deps = newDeps, root
  if (!(deps && deps.length)) {
    if (config === undefined) config = true
    if (config) {
      let def
      if (config === true) {
        root = await findRoot(cwd, verbose)
        config = join(root, 'package-links.json')
        def = true
      } else {
        config = resolve(config)
      }
      try {
        deps = await readJSON(config, verbose)
      } catch (err) {
        if (!def || err.code !== 'ENOENT') throw err
        if (verbose) log(`"${shorten(config)}" not found`)
      }
    } else {
      root = await findRoot(cwd, verbose)
      deps = await loadConfig('links', root, verbose)
    }
    deps = deps.linkDependencies
  }
  let inspectedDeps
  if (deps) {
    if (Array.isArray(deps)) {
      inspectedDeps = await inspectDeps(deps, verbose)
      deps = inspectedDeps.reduce((result, { name, path }) => {
        if (verbose) log(`dependency ${name} => "${path}" included`)
        result[name] = path
        return result
      }, {})
    }
  } else {
    deps = {}
  }
  const { length } = Object.keys(deps)
  if (!length) {
    return console.log('no dependencies to link')
  }

  // link the deps
  if (list === undefined) list = process.env.npm_config_list !== ''
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (dryRun) {
    // simulate the output of the linking script
    const duration = Math.trunc(performance.now() - start)
    const suffix = length > 1 ? 's' : ''
    console.log(`\nlinked ${length} package${suffix} in ${duration}ms`)
    if (list) listDeps(deps, true)
    return
  }
  if (junctions === undefined) junctions = process.env.npm_config_junctions !== ''
  if (!root) root = await findRoot(cwd, verbose)
  await createLinks(deps, root, junctions, verbose);

  // get and print the paths of the linked deps
  if (list) listDeps(deps, true)

  // save the newly linked deps to the config file
  if (save !== false && inspectedDeps) {
    await linkDeps(inspectedDeps, config, root, lineBreak, verbose)
  }
}
