import { join } from 'path'
import readJSON from '../../../src/read-json.js'

// Retrieves names and versions of packages at the specified paths.
export default function inspectDeps(paths, verbose) {
  return Promise.all(paths.map(async path => {
    const { name, version } = await readJSON(join(path, 'package.json'), verbose)
    return { path, name, version }
  }))
}
