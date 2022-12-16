import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))


const commonConfig = {
  input: 'src/index.ts',
  plugins: [
    resolve(),
    commonjs(),
    esbuild({
      minify: true,
    }),
  ],
  external: [
    'html-minifier',
    'juice',
    'svgpath',
    'xmldom',
  ],
}

export default [
  {
    ...commonConfig,
    output: {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
  },
  {
    ...commonConfig,
    output: {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
    },
  },
  {
    input: commonConfig.input,
    output: {
      file: pkg.types,
      format: 'esm',
    },
    plugins: [
      dts(),
    ],
  },
]

