import {
  installExtraDependencies, uninstallExtraDependencies, setupExtraDependencies
} from '@pkgdep/extra'

declare type testCallback = () => void
declare function test (label: string, callback: testCallback): void

test('Type declarations for TypeScript', async () => {
  await installExtraDependencies()
  await installExtraDependencies([])
  await installExtraDependencies(['test'])
  await installExtraDependencies(undefined, {})
  await installExtraDependencies(null, { config: 'test' })
  await installExtraDependencies(null, { config: false })
  await installExtraDependencies(null, { cwd: 'test' })
  await installExtraDependencies(null, { save: false })
  await installExtraDependencies(null, { lineBreak: false })
  await installExtraDependencies(null, { progress: false })
  await installExtraDependencies(null, { list: false })
  await installExtraDependencies(null, { verbose: true })
  await installExtraDependencies(null, { dryRun: true })

  await uninstallExtraDependencies(['test'])
  await uninstallExtraDependencies(null, { config: 'test' })
  await uninstallExtraDependencies(null, { config: false })
  await uninstallExtraDependencies(null, { cwd: 'test' })
  await uninstallExtraDependencies(null, { save: false })
  await uninstallExtraDependencies(null, { lineBreak: false })
  await uninstallExtraDependencies(null, { progress: false })
  await uninstallExtraDependencies(null, { list: false })
  await uninstallExtraDependencies(null, { verbose: true })
  await uninstallExtraDependencies(null, { dryRun: true })

  await setupExtraDependencies()
  await setupExtraDependencies({ config: 'test' })
  await setupExtraDependencies({ config: false })
  await setupExtraDependencies({ cwd: 'test' })
  await setupExtraDependencies({ lineBreak: false })
  await setupExtraDependencies({ progress: false })
  await setupExtraDependencies({ list: false })
  await setupExtraDependencies({ verbose: true })
  await setupExtraDependencies({ dryRun: true })
})
