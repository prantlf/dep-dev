import { join } from 'path'
import readJSON from './read-json.js'

export default async function resolveConfig(type, config, root, preferSeparate, checkProperty) {
  let pkg
  if (config === undefined) {
    config = join(root, `package-${type}.json`)
    try {
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      const pkgConfig = join(root, 'package.json')
      pkg = await readJSON(pkgConfig)
      if (preferSeparate && !pkg[checkProperty]) {
        pkg = {}
      } else {
        config = pkgConfig
      }
    }
  } else if (config === true) {
    try {
      config = join(root, `package-${type}.json`)
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      pkg = {}
    }
  } else if (config) {
    try {
      pkg = await readJSON(config)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
      pkg = {}
    }
  } else {
    config = join(root, 'package.json')
    pkg = await readJSON(config)
  }
  return { config, pkg }
}
