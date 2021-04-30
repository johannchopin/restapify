import path from 'path'
import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import sveltePreprocess from 'svelte-preprocess'
import typescript from '@rollup/plugin-typescript'
import scss from 'rollup-plugin-scss'
import inlineSvg from 'rollup-plugin-inline-svg';
import Restapify from 'restapify'

const production = !process.env.ROLLUP_WATCH
const apiFolderPath = path.resolve(__dirname, './api')

function serve() {
  let server
  const rpfy = new Restapify({
    rootDir: apiFolderPath,
    baseUrl: '/dev/restapify/api'
  })

  rpfy.run()

  function toExit() {
    if (server) { 
      server.kill(0)
      rpfy.close()
    }
  }

  return {
    writeBundle() {
      if (server) return
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      })

      process.on('SIGTERM', toExit)
      process.on('exit', toExit)
    }
  }
}

export default {
  input: 'src/main.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    replace({
      __NODE_ENV__: production ? JSON.stringify('production') : JSON.stringify('development')
    }),

    scss({ output: 'public/build/global.bundle.css' }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: css => {
        css.write('bundle.css')
      },
      preprocess: sveltePreprocess()
    }),

    inlineSvg(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      extensions: ['.svelte', '.js']
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
      include: [
        './**/*.ts',
        '../types/**/*.ts'
      ]
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
}
