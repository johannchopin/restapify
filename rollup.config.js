import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const extensions = [
  '.ts',
];

const name = 'RollupTypeScriptBabel';

export default {
  input: './src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs', exports: 'named' },
    { file: pkg.module, format: 'es', exports: 'named' }
  ],

  // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  external: ['path', 'fs', 'http', 'express', 'open', 'lodash.range', 'boxen', 'commander', 'chalk', 'chokidar'],

  plugins: [
    json(),
    typescript(),

    babel({
      extensions,
      babelHelpers: 'bundled',
      include: ['src/**/*'],
    }),

    // Allows node_modules resolution
    nodePolyfills(),

    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),
  ]
};