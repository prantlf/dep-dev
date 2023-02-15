#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  linkDependencies, unlinkDependencies, setupLinkDependencies
} from '../dist/index.js'

function getPackage() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
}

function help() {
  console.log(`${getPackage().description}

Usage: dep-link [-cdjsbplv] <command> [--] [package...]

Commands:
  setup|s    prepare a NPM project to use @pkgdep/link
  link|ln    replace a package directory in node_modules with a symbolic
             link to a local directory with the NPM package development
  unlink|un  remove a symbolic link in node_modules with the NPM package

Options:
  -c|--config <file>    configuration file with the dependencies
  -d|--directory <dir>  directory in which to run the npm commands   (.)
  -j|--[no-]junctions   prefer creating junctions on Windows         (true)
  -s|--[no-]save        save the arguments to the configuration file (true)
  -b|--[no-]line-break  end the configuration file with a line break (true)
  -p|--[no-]progress    enable progress output for the npm commands  (true)
  -l|--[no-]list        enable listing the extra installed packages  (true)
  -v|--[no-]verbose     enable verbose output for the npm commands   (false)
  --dry-run             only print what packages would be installed  (false)
  -V|--version          print version number
  -h|--help             print usage instructions

The default configuration file is package-links.json in the package root and
if not found, then package.json. The file should include linkDependencies.

Examples:
$ dep-link
$ dep-link ln my-dep
$ dep-link ln -d test -v`)
}

// options
const { argv } = process
const args = []
let   config, cwd, junctions, save, lineBreak, progress, list, verbose, dryRun

function fail(message) {
  console.error(message)
  process.exit(1)
}

// collect the options from the args
for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  const match = /^(-|--)(no-)?([a-zA-Z][-a-zA-Z]*)(?:=(.*))?$/.exec(arg)
  if (match) {
    const parseArg = (arg, flag) => {
      switch (arg) {
        case 'c': case 'config':
          config = match[4] || argv[++i]
          return
        case 'd': case 'directory':
          cwd = match[4] || argv[++i]
          return
        case 'j': case 'junctions':
          junctions = flag
          return
        case 'J':
          junctions = !flag
          return
        case 's': case 'save':
          save = flag
          return
        case 'S':
          save = !flag
          return
        case 'b': case 'line-break':
          lineBreak = flag
          return
        case 'B':
          lineBreak = !flag
          return
        case 'p': case 'progress':
          progress = flag
          return
        case 'P':
          progress = false
          return
        case 'l': case 'list':
          list = flag
          return
        case 'L':
          list = !flag
          return
        case 'v': case 'verbose':
          verbose = flag
          return
        case 'dry-run':
          dryRun = flag
          return
        case 'V': case 'version':
          console.log(getPackage().version)
          process.exit(0)
          break
        case 'h': case 'help':
          help()
          process.exit(0)
      }
      fail(`unknown option: "${arg}"`)
    }
    if (match[1] === '-') {
      const flags = match[3].split('')
      for (const flag of flags) parseArg(flag, true)
    } else {
      parseArg(match[3], match[2] !== 'no-')
    }
    continue
  }
  if (arg === '--') {
    args.push(...argv.slice(i + 1, l))
    break
  }
  args.push(arg)
}

// find the command and the deps in the args
if (!args.length) {
  help()
  process.exit(1)
}
const [command, ...deps] = args

// execute the requested command
try {
  if (command === 'link' || command === 'ln') {
    await linkDependencies(deps, {
      config, cwd, junctions, save, lineBreak, list, verbose, dryRun
    })
  } else if (command === 'unlink' || command === 'un') {
    if (!deps.length) fail('packages to unlink missing')
    await unlinkDependencies(deps, {
      config, cwd, save, lineBreak, list, verbose, dryRun
    })
  } else if (command === 'setup' || command === 's') {
    await setupLinkDependencies({
      config, cwd, lineBreak, progress, list, verbose, dryRun
    })
  } else {
    fail(`unknown command: "${command}"`)
  }
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
