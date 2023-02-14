import {
  linkDependencies, unlinkDependencies, setupLinkDependencies
} from '@pkgdep/link'

declare type testCallback = () => void
declare function test (label: string, callback: testCallback): void

test('Type declarations for TypeScript', async () => {
  await linkDependencies()
  await linkDependencies([])
  await linkDependencies(['test'])
  await linkDependencies(undefined, {})
  await linkDependencies(null, { config: 'test' })
  await linkDependencies(null, { config: false })
  await linkDependencies(null, { cwd: 'test' })
  await linkDependencies(null, { junctions: false })
  await linkDependencies(null, { save: false })
  await linkDependencies(null, { lineBreak: false })
  await linkDependencies(null, { list: false })
  await linkDependencies(null, { verbose: true })
  await linkDependencies(null, { dryRun: true })

  await unlinkDependencies(['test'])
  await unlinkDependencies(null, { config: 'test' })
  await unlinkDependencies(null, { config: false })
  await unlinkDependencies(null, { cwd: 'test' })
  await unlinkDependencies(null, { save: false })
  await unlinkDependencies(null, { lineBreak: false })
  await unlinkDependencies(null, { list: false })
  await unlinkDependencies(null, { verbose: true })
  await unlinkDependencies(null, { dryRun: true })

  await setupLinkDependencies()
  await setupLinkDependencies({ config: 'test' })
  await setupLinkDependencies({ config: false })
  await setupLinkDependencies({ cwd: 'test' })
  await setupLinkDependencies({ lineBreak: false })
  await setupLinkDependencies({ progress: false })
  await setupLinkDependencies({ list: false })
  await setupLinkDependencies({ verbose: true })
  await setupLinkDependencies({ dryRun: true })
})
