import { join } from 'path'
import readJSON from '../../../src/read-json.js'

export default function inspectDeps(paths) {
  return Promise.all(paths.map(async path => {
    const { name, version } = await readJSON(join(path, 'package.json'))
    return { path, name, version }
  }))
}
