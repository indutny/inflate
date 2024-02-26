import { readFile } from 'node:fs/promises';
import { createDeflateRaw, constants } from 'node:zlib';
// eslint-disable-next-line import/no-unresolved
import test from 'ava';

import Inflate from '../lib/inflate.js';

test('it inflates uncompressed data', async (t) => {
  const d = createDeflateRaw({
    level: 0,
  });

  d.write('hello');
  d.flush(constants.Z_BLOCK);
  d.write('deflate');
  d.flush(constants.Z_BLOCK);
  d.write('!');
  d.end();

  const result = [];

  const inflate = new Inflate({
    onBlock: (block) => result.push(Buffer.from(block).toString()),
  });
  for await (const chunk of d) {
    for (const byte of chunk) {
      inflate.push(byte);
    }
  }
  inflate.finish();
  t.deepEqual(result, ['hello', 'deflate', '!']);
});

test('it inflates fixed encoding data', async (t) => {
  const d = createDeflateRaw({
    strategy: constants.Z_FIXED,
  });

  d.write('hello');
  d.flush(constants.Z_BLOCK);
  d.write('deflate');
  d.flush(constants.Z_BLOCK);
  d.write('!');
  d.end();

  const result = [];

  const inflate = new Inflate({
    onBlock: (block) => result.push(Buffer.from(block).toString()),
  });
  for await (const chunk of d) {
    for (const byte of chunk) {
      inflate.push(byte);
    }
  }
  inflate.finish();
  t.deepEqual(result, ['hello', 'deflate', '!']);
});

test('it inflates fixed encoding repeated data', async (t) => {
  const d = createDeflateRaw({
    strategy: constants.Z_FIXED,
  });

  d.write('a'.repeat(16));
  d.end('b'.repeat(1024));

  const result = [];

  const inflate = new Inflate({
    onBlock: (block) => result.push(Buffer.from(block).toString()),
  });
  for await (const chunk of d) {
    for (const byte of chunk) {
      inflate.push(byte);
    }
  }
  inflate.finish();
  t.deepEqual(result, ['a'.repeat(16) + 'b'.repeat(1024)]);
});

test('it inflates dynamic encoding data', async (t) => {
  const d = createDeflateRaw({
    strategy: constants.Z_HUFFMAN_ONLY,
  });

  d.end('hello'.repeat(5));

  const result = [];

  const inflate = new Inflate({
    onBlock: (block) => result.push(Buffer.from(block).toString()),
  });
  for await (const chunk of d) {
    (await import('fs')).writeFileSync('/tmp/1.deflate', chunk);
    for (const byte of chunk) {
      inflate.push(byte);
    }
  }
  inflate.finish();
  t.deepEqual(result, ['hello'.repeat(5)]);
});

test('it inflates text file', async (t) => {
  const file = await readFile(new URL('../lib/inflate.js', import.meta.url));
  const d = createDeflateRaw();

  d.end(file);

  const result = [];

  const inflate = new Inflate({
    onBlock: (block) => result.push(Buffer.from(block)),
  });
  for await (const chunk of d) {
    (await import('fs')).writeFileSync('/tmp/1.deflate', chunk);
    for (const byte of chunk) {
      inflate.push(byte);
    }
  }
  inflate.finish();
  t.deepEqual(Buffer.concat(result).toString(), file.toString());
});
