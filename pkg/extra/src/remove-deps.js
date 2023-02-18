import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

// Removes the specified dependencies from the list for extra installation.
export default async function removeDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('extras', config, root))

  const { extraDependencies } = pkg
  if (!extraDependencies) return
  for (const name of deps) delete extraDependencies[name]

  await writeJSON(config, pkg, lineBreak)
}
