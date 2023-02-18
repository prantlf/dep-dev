import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

// Removes the specified dependencies from the list for upgrading.
export default async function downgradeDeps(deps, config, root, lineBreak, verbose) {
  let pkg
  ({ config, pkg } = await resolveConfig('updates', config, root, undefined, undefined, verbose))

  const { updateDependencies } = pkg
  // bail out if there are no upgradable dependencies
  if (!updateDependencies || !updateDependencies.length) return
  pkg.updateDependencies = updateDependencies.filter(dep => !deps.includes(dep))

  await writeJSON(config, pkg, lineBreak, verbose)
}
