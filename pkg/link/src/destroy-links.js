import { lstat, realpath, rm, unlink } from 'fs/promises'
import { join, relative } from 'path'
import readJSON from '../../../src/read-json.js'

function log(message) {
  console.log('dep-link', message)
}

async function destroyLink(name, root, verbose) {
  const cwd = process.cwd()
  const short = path => relative(cwd, path)

  const link = join(root, 'node_modules', name)
  if (verbose) log(`checking existence of ${short(link)}`)
  let prev, real
  try {
    prev = await lstat(link)
    if (prev.isSymbolicLink()) {
      if (verbose) log(`symlink ${short(link)} exists`)
			real = await realpath(link);
      if (verbose) log(`symlink ${short(link)} points to ${real}`)
		} else {
      throw new Error(`${short(link)} is not a link`)
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    if (verbose) {
      if (prev) log(`symlink ${short(link)} is invalid`)
      else log(`file ${short(link)} does not exist`)
    }
  }

  if (!prev) return
  if (!real) return remove()

  if (verbose) log(`reading package.json from ${short(link)}`)
  const pkg = await readJSON(join(link, 'package.json'))
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
    if (verbose) log(`unlinking ${short(link)}`)
    return unlink(link);
  }
}

export default async function destroyLinks(deps, root, verbose) {
  const start = performance.now()

  await Promise.all(deps.map(name => destroyLink(name, root, verbose)))

  const duration = Math.trunc(performance.now() - start)
  const suffix = deps.length > 1 ? 's' : ''
  console.log(`\nunlinked ${deps.length} package${suffix} in ${duration}ms`)
}
