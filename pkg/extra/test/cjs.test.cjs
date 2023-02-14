const exported = require('@pkgdep/extra')
const { ok, strictEqual } = require('assert')

ok(exported, 'export not empty')
strictEqual(typeof exported, 'object', 'export is object')

const {
  installExtraDependencies, uninstallExtraDependencies, setupExtraDependencies
} = exported
strictEqual(typeof installExtraDependencies, 'function', 'install function exported')
strictEqual(typeof uninstallExtraDependencies, 'function', 'uninstall function exported')
strictEqual(typeof setupExtraDependencies, 'function', 'setup function exported')
