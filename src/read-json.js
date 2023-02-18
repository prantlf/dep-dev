import { readFile } from 'fs/promises'

// Reads and parses a JSON file.
export default async function readJSON(config) {
  const content = await readFile(config, 'utf8')
  return JSON.parse(content)
}
