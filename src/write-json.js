import { writeFile } from 'fs/promises'

// Serialises and writes a JSON file.
export default async function writeJSON(config, pkg, lineBreak) {
  let contents = JSON.stringify(pkg, undefined, 2)
  // terminate the file with a line break by default
  if (lineBreak !== false) contents = `${contents}\n`
  await writeFile(config, contents)
}
