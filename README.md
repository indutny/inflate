# @indutny/inflate

[![npm](https://img.shields.io/npm/v/@indutny/inflate)](https://www.npmjs.com/package/@indutny/inflate)

When generating the build files for macOS with
[electron-builder](https://www.electron.build/) the two natural artifacts for
the updates are:

- a compressed zip file with the app
- a blockmap file

Where blockmap file is leveraged for effective incremental downloads, or in
other words downloading only the updated parts of the new version of the app.

While using incremental downloads reduces download size dramatically it behaves
unoptimally with regards to the [asar](https://github.com/electron/asar) package
that contains most app's source files. The reason for this is that in a zip
archive all files are compressed individually, but after compression each file
has a high entropy and looks like mostly different blob when comparing
the blockmaps.

This CLI tool mitigates this by taking in account the asar file structure when
compressing it. Instead of [deflating](https://en.wikipedia.org/wiki/Deflate)
whole file as a single blob, we split it into logical chunks (one for every
sub-file) and flush zlib stream after each chunk. This means that the same
sub-files in asar are likely to result in the same compressed binary chunks in
the resultant optimized .zip file.

## Installation

```sh
npm install @indutny/inflate
```

## Usage

```js
import Inflate from '@indutny/inflate';

const blocks = [];

const inflate = new Inflate({
  onBlock(block) {
    blocks.push(Buffer.from(block));
  },
});

for (const byte of buffer) {
  inflate.push(byte);
}
inflate.finish();

console.log(Buffer.concat(blocks));
```

## LICENSE

This software is licensed under the MIT License.
