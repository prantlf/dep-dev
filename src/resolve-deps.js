import { join } from 'path'
import readJSON from './read-json.js'

export default async function resolveDeps(deps, root) {
  const pkgs = await Promise.all(deps.map(dep => {
    const version = dep.indexOf('@', 1)
    const name = version > 0 ? dep.slice(0, version) : dep
    return readJSON(join(root, 'node_modules/', name, 'package.json'))
  }))

  deps = {}
  for (const { name, version } of pkgs) deps[name] = version
  return deps
}
