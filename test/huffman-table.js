// eslint-disable-next-line import/no-unresolved
import test from 'ava';

import HuffmanTable from '../lib/huffman-table.js';

test('it creates a config', (t) => {
  const config = HuffmanTable.createConfig([
    0x0a, 3, 0x0b, 3, 0x0c, 3, 0x0d, 3, 0x0e, 3, 0x0f, 2, 0x10, 4, 0x11, 4,
  ]);

  t.deepEqual(config, [
    { start: 0, end: 0, values: [] },
    { start: 0, end: 1, values: [0x0f] },
    { start: 2, end: 7, values: [0x0a, 0x0b, 0x0c, 0x0d, 0x0e] },
    { start: 14, end: 16, values: [0x10, 0x11] },
  ]);

  const table = new HuffmanTable(config);

  t.is(table.minPrefix, 2);

  t.is(table.lookup(0b010, 3), 0x0a);
  t.is(table.lookup(0b011, 3), 0x0b);
  t.is(table.lookup(0b100, 3), 0x0c);
  t.is(table.lookup(0b101, 3), 0x0d);
  t.is(table.lookup(0b110, 3), 0x0e);

  t.is(table.lookup(0b00, 2), 0x0f);

  t.is(table.lookup(0b1110, 4), 0x10);
  t.is(table.lookup(0b1111, 4), 0x11);
});
