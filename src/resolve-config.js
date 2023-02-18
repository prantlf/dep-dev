import { join } from 'path'
import readJSON from './read-json.js'

// Infers the name loads the content of the configuration file.
export default async function resolveConfig(type, config, root, preferSeparate, checkProperty) {
  let pkg
  // undefined config means trying a separate file first and then package.json
  if (config === undefined) {
    config = join(root, `package-${type}.json`)
    try {
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      const pkgConfig = join(root, 'package.json')
      pkg = await readJSON(pkgConfig)
      // package.json will be used (and created) if it contains
      // the configuration object or if the separate file is not preferred
      if (preferSeparate && !pkg[checkProperty]) {
        pkg = {}
      } else {
        config = pkgConfig
      }
    }
  // true config means using a separate file with the default name
  } else if (config === true) {
    try {
      config = join(root, `package-${type}.json`)
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      pkg = {}
    }
  // explicit config means using a custom file
  } else if (config) {
    try {
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      pkg = {}
    }
  // otherwise package.json will be used
  } else {
    config = join(root, 'package.json')
    pkg = await readJSON(config)
  }
  return { config, pkg }
}
