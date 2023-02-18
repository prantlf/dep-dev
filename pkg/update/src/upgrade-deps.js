import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

// Adds the specified dependencies to the list for upgrading.
export default async function upgradeDeps(deps, config, root, lineBreak, verbose) {
  let pkg
  ({ config, pkg } = await resolveConfig('updates', config, root, undefined, undefined, verbose))

  let { updateDependencies } = pkg
  if (!updateDependencies) updateDependencies = []
  // filter out the dependencies that have been already added
  const newDeps = deps.filter(dep => !updateDependencies.includes(dep))
  pkg.updateDependencies = updateDependencies.push(...newDeps)

  await writeJSON(config, pkg, lineBreak, verbose)
}
