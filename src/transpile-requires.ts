import { transform } from '@babel/core';
import { extname } from 'path';
import { addHook } from 'pirates';
import AllSyntaxPlugin from './AllSyntaxPlugin';

let useBabelrc = false;
let revert: (() => void) | null = null;

export const SUPPORTED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.es',
  '.es6',
  '.mjs',
  '.ts'
]);

export function hook(code: string, filename: string): string {
  let ext = extname(filename);

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(`cannot load file type '${ext}': ${filename}`);
  }

  let options = {
    filename,
    babelrc: useBabelrc,
    presets: [] as Array<string>,
    plugins: [AllSyntaxPlugin],
    sourceMaps: 'inline'
  };

  if (!useBabelrc) {
    if (ext === '.ts') {
      options.presets.push(require.resolve('@babel/preset-typescript'));
    }

    options.presets.push(require.resolve('@babel/preset-env'));
  }

  return transform(code, options).code as string;
}

export function enable(babelrc: boolean = false) {
  disable();
  useBabelrc = babelrc;
  revert = addHook(hook, {
    exts: Array.from(SUPPORTED_EXTENSIONS),
    ignoreNodeModules: true
  });
}

export function disable() {
  if (revert) {
    revert();
    revert = null;
  }
}
