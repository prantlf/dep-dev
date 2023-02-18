import { join, resolve } from 'path'
import readJSON from '../../../src/read-json.js'
import findRoot from '../../../src/find-root.js'
import writeJSON from '../../../src/write-json.js'
import installTool from '../../../src/install-tool.js'

// Prepares package.json and other configuration files to automate updates
// of selected dependencies using this package.
export async function setupUpdateDependencies({ config, cwd, lineBreak, progress, list, verbose, dryRun } = {}) {
  const start = performance.now()

  // find the preferred configuration file
  const root = await findRoot(cwd)
  const pkg = join(root, 'package.json')
  if (config === true) config = join(root, 'package-updates.json')
  else if (!config) config = pkg
  else config = resolve(config)
  const same = config === pkg

  // load both package.json and the configuration file, the same or separate
  const proj = await readJSON(pkg)
  let deps
  if (same) {
    deps = proj
  } else {
    try {
      deps = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  // make sure that the configuration file contains the dependency list
  let saveDeps
  if (!deps) {
    deps = {}
    saveDeps = true
  } else if (!deps.updateDependencies) {
    deps.updateDependencies = []
    saveDeps = true
  }

  // automate the updating in the npm prepare phase as the first step
  let saveProj
  const { scripts, dependencies, devDependencies } = proj
  if (!scripts) {
    proj.scripts = { prepare: 'dep-update up' }
    saveProj = true
  } else {
    const { prepare } = scripts
    if (!prepare) {
      scripts.prepare = 'dep-update up'
      saveProj = true
    } else if (!/\bdep-update\b/.test(prepare)) {
      scripts.prepare = `dep-update up && ${prepare}`
      saveProj = true
    }
  }

  // write changes to package.json separate configuration file and .gitignore
  if (dryRun === undefined) dryRun = process.env.npm_config_dry_run
  if (!dryRun) {
    if (same) {
      if (saveDeps || saveProj) await writeJSON(config, deps, lineBreak)
    } else {
      await Promise.all([
        saveDeps && await writeJSON(config, deps, lineBreak),
        saveProj && await writeJSON(pkg, proj, lineBreak)
      ])
    }
  }

  // add this package to development dependencies
  if (!(dependencies && dependencies['@pkgdep/update'] ||
      devDependencies && devDependencies['@pkgdep/update'])) {
    await installTool('@pkgdep/update', root, list, progress, verbose, dryRun, start)
  }
}
