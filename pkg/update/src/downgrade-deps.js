import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

export default async function downgradeDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('updates', config, root))

  const { updateDependencies } = pkg
  if (!updateDependencies) return
  pkg.updateDependencies = updateDependencies.filter(dep => !deps.includes(dep))

  await writeJSON(config, pkg, lineBreak)
}
