import { join } from 'path'
import readJSON from './read-json.js'

export default async function loadConfig(type, root) {
  try {
    return await readJSON(join(root, `package-${type}.json`))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    return await readJSON(join(root, 'package.json'))
  }
}
