const exported = require('@pkgdep/link')
const { ok, strictEqual } = require('assert')

ok(exported, 'export not empty')
strictEqual(typeof exported, 'object', 'export is object')

const {
  linkDependencies, unlinkDependencies, setupLinkDependencies
} = exported
strictEqual(typeof linkDependencies, 'function', 'install function exported')
strictEqual(typeof unlinkDependencies, 'function', 'uninstall function exported')
strictEqual(typeof setupLinkDependencies, 'function', 'setup function exported')
