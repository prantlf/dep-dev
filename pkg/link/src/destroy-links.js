import { lstat, realpath, rm, unlink } from 'fs/promises'
import { join } from 'path'
import { shorten } from '../../../src/log.js'
import readJSON from '../../../src/read-json.js'
import log from './log.js'

// Removes a link to a dependency directory and all bin scripts from that
// dependency that were installed to node_modules/.bin.
async function destroyLink(name, root, verbose) {
  const link = join(root, 'node_modules', name)
  if (verbose) log(`checking existence of ${shorten(link)}`)
  let prev, real
  try {
    prev = await lstat(link)
    if (prev.isSymbolicLink()) {
      if (verbose) log(`symlink ${shorten(link)} exists`)
			real = await realpath(link);
      if (verbose) log(`symlink ${shorten(link)} points to ${real}`)
		} else {
      throw new Error(`${shorten(link)} is not a link`)
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    if (verbose) {
      if (prev) log(`symlink ${shorten(link)} is invalid`)
      else log(`file ${shorten(link)} does not exist`)
    }
  }

  if (!prev) return
  if (!real) return remove()

  const pkg = await readJSON(join(link, 'package.json'), verbose)
  const { bin } = pkg
  if (bin) {
    if (typeof bin === 'string') pkg.bin = { [name]: bin }
    const links = Object.keys(bin)
    if (verbose) log(`unlinking bin scripts for ${name}: ${links.join(', ')}`)
    await Promise.all(links.map(name => {
      let link = join(root, 'node_modules/.bin', name)
      if (process.platform === 'win32') link = `${link}.cmd`
      log(`unlinking ${link}`)
      return rm(link, { force: true })
    }))
  }

  return remove()

  function remove() {
    if (verbose) log(`unlinking ${shorten(link)}`)
    return unlink(link);
  }
}

// Removes links to specified dependency directories and all bin scripts
// from those dependencies that were installed to node_modules/.bin.
export default async function destroyLinks(deps, root, verbose) {
  const start = performance.now()

  await Promise.all(deps.map(name => destroyLink(name, root, verbose)))

  const duration = Math.trunc(performance.now() - start)
  const suffix = deps.length > 1 ? 's' : ''
  console.log(`\nunlinked ${deps.length} package${suffix} in ${duration}ms`)
}
