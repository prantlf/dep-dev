#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  installExtraDependencies, uninstallExtraDependencies, setupExtraDependencies
} from '../dist/index.js'

// load package.json of this package
function getPkg() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
}

function help() {
  console.log(`${getPkg().description}

Usage: dep-extra [-cdsbplv] <command> [--] [package...]

Commands:
  setup|s                   prepare a NPM project to use @pkgdep/extra
  install|i|add             install an extra dependency and if none
                            provided, read the configuration file
  uninstall|un|remove|rm|r  uninstall an extra dependency

Options:
  -c|--config <file>    configuration file with the dependencies
  -d|--directory <dir>  directory in which to run the npm commands   (.)
  -s|--[no-]save        save the arguments to the configuration file (true)
  -b|--[no-]line-break  end the configuration file with a line break (true)
  -p|--[no-]progress    enable progress output for the npm commands  (true)
  -l|--[no-]list        enable listing the extra installed packages  (true)
  -v|--[no-]verbose     enable verbose output for the npm commands   (false)
  --dry-run             only print what packages would be installed  (false)
  -V|--version          print version number
  -h|--help             print usage instructions

The default configuration file is package-extras.json in the package root and
if not found, then package.json. The file should include extraDependencies.

Examples:
$ dep-extra
$ dep-extra i my-dep
$ dep-extra i -d test -v`)
}

// options
const { argv } = process
const args = []
let   config, cwd, save, lineBreak, progress, list, verbose, dryRun

function fail(message) {
  console.error(message)
  process.exit(1)
}

// collect the options from the args
for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  // matched groups: 1:-|-- 2:[no] 3:option 4:[=value]
  const match = /^(-|--)(no-)?([a-zA-Z][-a-zA-Z]*)(?:=(.*))?$/.exec(arg)
  if (match) {
    const value = () => match[4] || argv[++i]
    const parseArg = (arg, flag) => {
      switch (arg) {
        case 'c': case 'config':
          config = value()
          return
        case 'd': case 'directory':
          cwd = value()
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
          console.log(getPkg().version)
          process.exit(0)
          break
        case 'h': case 'help':
          help()
          process.exit(0)
      }
      fail(`unknown option: "${arg}"`)
    }
    if (match[1] === '-') {
      // single option letters after a single dash may be joined
      const flags = match[3].split('')
      for (const flag of flags) parseArg(flag, true)
    } else {
      // a long option may be followed by =value, or the value will be
      // in the next argument
      parseArg(match[3], match[2] !== 'no-')
    }
    continue
  }
  // double-dash divides options from other arguments, which may start with a dash
  if (arg === '--') {
    args.push(...argv.slice(i + 1, l))
    break
  }
  // an argument not starting with a dash is not an option
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
  if (command === 'install' || command === 'i' || command === 'add') {
    await installExtraDependencies(deps, {
      config, cwd, save, lineBreak, progress, list, verbose, dryRun
    })
  } else if (command === 'uninstall' || command === 'un' ||
             command === 'remove' || command === 'rm' || command === 'r') {
    if (!deps.length) fail('packages to remove missing')
    await uninstallExtraDependencies(deps, {
      config, cwd, save, lineBreak, progress, list, verbose, dryRun
    })
  } else if (command === 'setup' || command === 's') {
    await setupExtraDependencies({
      config, cwd, lineBreak, progress, list, verbose, dryRun
    })
  } else {
    fail(`unknown command: "${command}"`)
  }
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
