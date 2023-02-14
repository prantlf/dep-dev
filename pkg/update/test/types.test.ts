import {
  upgradeDependencies, downgradeDependencies, setupUpdateDependencies
} from '@pkgdep/update'

declare type testCallback = () => void
declare function test (label: string, callback: testCallback): void

test('Type declarations for TypeScript', async () => {
  await upgradeDependencies()
  await upgradeDependencies([])
  await upgradeDependencies(['test'])
  await upgradeDependencies(undefined, {})
  await upgradeDependencies(null, { config: 'test' })
  await upgradeDependencies(null, { config: false })
  await upgradeDependencies(null, { cwd: 'test' })
  await upgradeDependencies(null, { save: false })
  await upgradeDependencies(null, { lineBreak: false })
  await upgradeDependencies(null, { progress: false })
  await upgradeDependencies(null, { list: false })
  await upgradeDependencies(null, { verbose: true })
  await upgradeDependencies(null, { dryRun: true })

  await downgradeDependencies(['test'])
  await downgradeDependencies(null, { config: 'test' })
  await downgradeDependencies(null, { config: false })
  await downgradeDependencies(null, { cwd: 'test' })
  await downgradeDependencies(null, { save: false })
  await downgradeDependencies(null, { lineBreak: false })
  await downgradeDependencies(null, { progress: false })
  await downgradeDependencies(null, { list: false })
  await downgradeDependencies(null, { verbose: true })
  await downgradeDependencies(null, { dryRun: true })

  await setupUpdateDependencies()
  await setupUpdateDependencies({ config: 'test' })
  await setupUpdateDependencies({ config: false })
  await setupUpdateDependencies({ cwd: 'test' })
  await setupUpdateDependencies({ lineBreak: false })
  await setupUpdateDependencies({ progress: false })
  await setupUpdateDependencies({ list: false })
  await setupUpdateDependencies({ verbose: true })
  await setupUpdateDependencies({ dryRun: true })
})
