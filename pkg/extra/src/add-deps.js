import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

export default async function addDeps(deps, versions, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('extras', config, root))

  let { extraDependencies } = pkg
  if (!extraDependencies) extraDependencies = pkg.extraDependencies = {}
  for (const name of deps) extraDependencies[name] = versions[name]

  await writeJSON(config, pkg, lineBreak)
}
