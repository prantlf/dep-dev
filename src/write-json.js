import { writeFile } from 'fs/promises'
import { log, shorten } from './log.js'

// Serialises and writes a JSON file.
export default async function writeJSON(config, pkg, lineBreak, verbose) {
  if (verbose) log(`writing "${shorten(config)}"`)
  let contents = JSON.stringify(pkg, undefined, 2)
  // terminate the file with a line break by default
  if (lineBreak !== false) contents = `${contents}\n`
  await writeFile(config, contents)
}
