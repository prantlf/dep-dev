#!/usr/bin/env node

import { readFile } from 'fs/promises'

const file = `node_modules/${process.argv[2]}/package.json`
const { version } = JSON.parse(await readFile(file), 'utf8')
console.log(version)
