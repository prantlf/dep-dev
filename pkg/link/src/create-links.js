import { lstat, mkdir, realpath, rm, symlink } from 'fs/promises'
import { dirname, join, relative, resolve } from 'path'
import readJSON from '../../../src/read-json.js'
import binLinks from 'bin-links'

// Logs a message with the prefix of this package.
function log(message) {
  console.log('dep-link', message)
}

// Creates a link to a dependency directory and installs all bin scripts
// from that dependency to node_modules/.bin.
async function createLink(name, root, target, type, verbose) {
  const cwd = process.cwd()
  const short = path => relative(cwd, path)

  const link = join(root, 'node_modules', name)
  const dir = dirname(link)
  if (verbose) log(`ensuring directory ${short(dir)}`)
  await mkdir(dir, { recursive: true })
  const path = relative(dir, resolve(target))

  if (verbose) log(`checking existence of ${short(link)}`)
  let prev
  try {
    prev = await lstat(link)
    if (prev.isSymbolicLink()) {
      if (verbose) log(`symlink ${short(link)} already exists`)
			const real = await realpath(link);
			if (target === real) {
        if (verbose) log(`symlink ${short(link)} already points to ${real}`)
        return
      }
		}
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    if (verbose) {
      if (prev) log(`symlink ${short(link)} is invalid`)
      else log(`file ${short(link)} does not exist`)
    }
  }

  if (prev) {
    if (verbose) log(`removing ${short(link)}`)
    await rm(link, { recursive: true })
  }

  if (verbose) log(`creating link ${short(link)} pointing to ${short(path)}`)
	await symlink(path, link, type)

  if (verbose) log(`reading package.json from ${short(link)}`)
  const pkg = await readJSON(join(link, 'package.json'))
  const { bin } = pkg
  if (bin) {
    if (typeof bin === 'string') pkg.bin = { [name]: bin }
    if (verbose) {
      log(`linking bin scripts for ${name}: ${JSON.stringify(bin, undefined, 2)}`)
      const links = binLinks.getPaths({ path: link, pkg })
      log(`links for ${name}: ${JSON.stringify(links.map(short), undefined, 2)}`)
    }
    await binLinks({ path: link, pkg, force: true })
  }
}

// Creates links to dpecified dependency directories and installs all bin
// scripts from those dependencies to node_modules/.bin.
export default async function createLinks(deps, root, junctions, verbose) {
  const start = performance.now()

  const names = Object.keys(deps)
  const type = junctions ? 'junction' : 'dir'
  await Promise.all(names.map(name => createLink(name, root, deps[name], type, verbose)))

  const duration = Math.trunc(performance.now() - start)
  const suffix = names.length > 1 ? 's' : ''
  console.log(`\nlinked ${names.length} package${suffix} in ${duration}ms`)
}