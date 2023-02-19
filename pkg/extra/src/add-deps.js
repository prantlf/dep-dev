import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

// Adds the specified dependencies to the list for extra installation.
export default async function addDeps(deps, versions, config, root, lineBreak, verbose) {
  let pkg
  ({ config, pkg } = await resolveConfig('extras', config, root, undefined, undefined, verbose))

  let { extraDependencies } = pkg
  if (!extraDependencies) extraDependencies = pkg.extraDependencies = {}
  for (const dep of deps) {
    const version = dep.indexOf('@', 1)
    const name = version > 0 ? dep.slice(0, version) : dep
    extraDependencies[name] = versions[name]
  }

  await writeJSON(config, pkg, lineBreak, verbose)
}
