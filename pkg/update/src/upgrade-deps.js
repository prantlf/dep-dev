import resolveConfig from '../../../src/resolve-config.js'
import writeJSON from '../../../src/write-json.js'

export default async function upgradeDeps(deps, config, root, lineBreak) {
  let pkg
  ({ config, pkg } = await resolveConfig('updates', config, root))

  let { updateDependencies } = pkg
  if (!updateDependencies) updateDependencies = []
  const newDeps = deps.filter(dep => !updateDependencies.includes(dep))
  pkg.updateDependencies = updateDependencies.push(...newDeps)

  await writeJSON(config, pkg, lineBreak)
}
