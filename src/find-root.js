import { access } from 'fs/promises'
import { join, resolve } from 'path'

// Finds the closest directory with package.json among the current one
// and its ancestors.
export default async function findRoot(curDir) {
  // prefer an explicit path of the project root during npm installation
  const startDir = curDir || process.env.INIT_CWD || process.cwd()
  let dir = resolve(startDir), prevDir
  do {
    try {
      await access(join(dir, 'package.json'))
      return dir
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    prevDir = dir
    dir = resolve(dir, '..') // ensure an absolute path without extra ..
  } while (prevDir !== dir) // until the root of the file system is reached
  throw new Error(`package.json not found in ${startDir} and its ancestors`)
}
