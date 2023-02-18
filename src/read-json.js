import { readFile } from 'fs/promises'
import { log, shorten } from './log.js';

// Reads and parses a JSON file.
export default async function readJSON(config, verbose) {
  if (verbose) log(`reading "${shorten(config)}"`)
  const content = await readFile(config, 'utf8')
  return JSON.parse(content)
}
