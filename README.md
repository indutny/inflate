# @indutny/inflate

[![npm](https://img.shields.io/npm/v/@indutny/inflate)](https://www.npmjs.com/package/@indutny/inflate)

**This is an education project, please don't use it in production**

Very naive and unoptimized implementation of Inflate part of the
[DEFLATE spec](https://datatracker.ietf.org/doc/html/rfc1951).

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
