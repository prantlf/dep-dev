import cleanup from 'rollup-plugin-cleanup'

export default ({ external = [] } = {}) => [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    external: ['child_process', 'fs/promises', 'path', 'url', ...external],
    plugins: [
      cleanup()
    ]
  }
]
