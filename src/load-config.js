import { join } from 'path'
import { log, shorten } from './log.js'
import readJSON from './read-json.js'

// Loads a configuration file, preferably the external one, if it exists,
// or the project package.json.
export default async function loadConfig(type, root, verbose) {
  const config = join(root, `package-${type}.json`)
  try {
    return await readJSON(config, verbose)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    if (verbose) log(`"${shorten(config)}" not found`)
    return await readJSON(join(root, 'package.json'), verbose)
  }
}
