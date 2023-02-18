import readPkg from './read-pkg.js'
import listDeps from './list-deps.js'
import spawnProcess from './spawn-process.js'
import resolveDeps from './resolve-deps.js'

// Installs an additional development dependency to the current project.
export default async function installTool(name, root, list, progress, verbose, dryRun, start) {
  const args = ['i', '-D']
  if (progress === false) args.push('--no-progress')
  if (verbose) args.push('--verbose')
  args.push(name);

  if (verbose) console.log(`> npm ${args.join(' ')}`)
  if (dryRun) {
    // simulate the npm output
    const duration = Math.trunc(performance.now() - start)
    console.log(`\nadded 1 package in ${duration}ms`)
    if (list !== false) {
      const { version } = await readPkg(verbose)
      listDeps({ [name]: version })
    }
  } else {
    await spawnProcess('npm', args, { cwd })
    if (list !== false) {
      const { [name]: version } = await resolveDeps([name], root, verbose)
      listDeps({ [name]: version })
    }
  }
}
