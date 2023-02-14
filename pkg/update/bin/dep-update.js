#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  upgradeDependencies, downgradeDependencies, setupUpdateDependencies
} from '../dist/index.js'

function getPkg() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
}

function help() {
  console.log(`${getPkg().description}

Usage: dep-update [-cdsbplv] <command> [--] [package...]

Commands:
  setup|s            prepare a NPM project to use @pkgdep/update
  update|upgrade|up  upgrade a dependency and if none provided,
                     read the configuration file
  downgrade|down     downgrade a dependency to the locked version

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

The default configuration file is package-updates.json in the package root and
if not found, then package.json. The file should include updateDependencies.

Examples:
$ dep-update
$ dep-update up my-dep
$ dep-update up -d test -v`)
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
        case 's': case 'save':
          save = flag
          return
        case 'b': case 'line-break':
          lineBreak = flag
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
  if (command === 'update' || command === 'upgrade' || command === 'up') {
    await upgradeDependencies(deps, {
      config, cwd, save, lineBreak, progress, list, verbose, dryRun
    })
  } else if (command === 'downgrade' || command === 'down') {
    if (!deps.length) fail('packages to downgrade missing')
    await downgradeDependencies(deps, {
      config, cwd, save, lineBreak, progress, list, verbose, dryRun
    })
  } else if (command === 'setup' || command === 's') {
    await setupUpdateDependencies({
      config, cwd, lineBreak, progress, list, verbose, dryRun
    })
  } else {
    fail(`unknown command: "${command}"`)
  }
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
