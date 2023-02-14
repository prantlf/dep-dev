import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readJSON from './read-json.js'

export default async function getPkg() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return await readJSON(join(__dirname, '../package.json'))
}
