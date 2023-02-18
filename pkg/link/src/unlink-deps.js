import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

// Removes the specified dependencies from the list for linking.
export default async function unlinkDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('links', config, root, true, 'linkDependencies'))

  const { linkDependencies } = pkg
  // bail out if there are no linkable dependencies
  if (!linkDependencies || !linkDependencies.length) return
  for (const name of deps) delete linkDependencies[name]

  await writeJSON(config, pkg, lineBreak)
}
