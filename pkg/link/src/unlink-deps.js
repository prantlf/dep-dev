import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

export default async function unlinkDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('links', config, root, true, 'linkDependencies'))

  const { linkDependencies } = pkg
  if (!linkDependencies) return
  for (const name of deps) delete linkDependencies[name]

  await writeJSON(config, pkg, lineBreak)
}
