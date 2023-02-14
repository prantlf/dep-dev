import { access } from 'fs/promises'
import { join, resolve } from 'path'

export default async function findRoot(curDir) {
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
    dir = resolve(dir, '..')
  } while (prevDir !== dir)
  throw new Error(`package.json not found in ${startDir} and its ancestors`)
}
