import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'loglevel-serverSend.js',
  output: [{
    name: 'loglevelServerSend',
    file: 'dist/bundle.js',
    format: 'umd'
  },
  {
    name: 'loglevelServerSend',
    file: 'dist/bundle.min.js',
    format: 'umd',
    plugins: [terser()]
  },
  {
    name: 'loglevelServerSend',
    file: 'dist/bundle.esm.js',
    format: 'esm'
  },
  {
    name: 'loglevelServerSend',
    file: 'lib/loglevelServerSend.js',
    format: 'umd'
  }],
  plugins: [nodeResolve({
    jsnext: true,
    main: true,
    browser: true,
  }),
  commonjs()
  ]
};