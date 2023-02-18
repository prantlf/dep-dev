import { join } from 'path'
import readJSON from './read-json.js'

// Loads a configuration file, preferably the external one, if it exists,
// or the project package.json.
export default async function loadConfig(type, root) {
  try {
    return await readJSON(join(root, `package-${type}.json`))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    return await readJSON(join(root, 'package.json'))
  }
}
