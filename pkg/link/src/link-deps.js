import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

export default async function linkDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('links', config, root, true, 'linkDependencies'))

  let { linkDependencies } = pkg
  if (!linkDependencies) linkDependencies = pkg.linkDependencies = {}
  for (const { name, path } of deps) linkDependencies[name] = path

  await writeJSON(config, pkg, lineBreak)
}
