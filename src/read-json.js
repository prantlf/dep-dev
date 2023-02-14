import { readFile } from 'fs/promises'

export default async function readJSON(config) {
  const content = await readFile(config, 'utf8')
  return JSON.parse(content)
}
