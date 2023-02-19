import { join } from 'path'
import readJSON from './read-json.js'
import { log, shorten } from './log.js'

// Find versions of specified first-level dependencies installed
// in node_modules of the current project and returns them in the format
// of the dependency object from package.json.
export default async function resolveDeps(deps, root, strict, verbose) {
  const pkgs = await Promise.all(deps.map(async dep => {
    // cut off the original version specifier, if the dependency includes it
    const version = dep.indexOf('@', 1)
    const name = version > 0 ? dep.slice(0, version) : dep
    const pkg = join(root, 'node_modules/', name, 'package.json')
    try {
      return await readJSON(pkg, verbose)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      if (verbose) log(`"${shorten(pkg)}" not found`)
      if (strict) throw err
      return { name }
    }
  }))

  deps = {}
  for (const { name, version } of pkgs) deps[name] = version
  return deps
}
