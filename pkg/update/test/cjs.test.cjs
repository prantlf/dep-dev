const exported = require('@pkgdep/update')
const { ok, strictEqual } = require('assert')

ok(exported, 'export not empty')
strictEqual(typeof exported, 'object', 'export is object')

const {
  upgradeDependencies, downgradeDependencies, setupUpdateDependencies
} = exported
strictEqual(typeof upgradeDependencies, 'function', 'install function exported')
strictEqual(typeof downgradeDependencies, 'function', 'uninstall function exported')
strictEqual(typeof setupUpdateDependencies, 'function', 'setup function exported')
