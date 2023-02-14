import { writeFile } from 'fs/promises'

export default async function writeJSON(config, pkg, lineBreak) {
  let contents = JSON.stringify(pkg, undefined, 2)
  if (lineBreak !== false) contents = `${contents}\n`
  await writeFile(config, contents)
}
