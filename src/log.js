import { relative } from 'path'

// Logs a message with the common prefix of all three packages.
export function log(message) {
  console.log('dep-dev', message)
}

let cwd

// Cuts the path to be based on the current process directory.
export function shorten(path) {
  if (!cwd) cwd = process.cwd()
  return relative(cwd, path)
}
