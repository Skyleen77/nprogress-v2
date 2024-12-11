/// <reference path="./node_modules/@types/node/index.d.ts"/>

import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  esbuildPlugins: [
    {
      name: 'copy-css',
      setup(build) {
        build.onEnd(() => {
          copyFileSync('./src/index.css', './dist/index.css');
        });
      },
    },
  ],
});
