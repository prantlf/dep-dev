import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readJSON from './read-json.js'

// Reads and parses package.json of this package.
export default async function readPkg() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return await readJSON(join(__dirname, '../package.json'))
}
