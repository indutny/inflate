/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import ParserBase from '../lib/parser-base.js';

test('parses 3-bit words', (t) => {
  const words = [];
  class Parser extends ParserBase {
    *parse() {
      while (true) {
        words.push(yield 3);
      }
    }
  }

  const p = new Parser();

  p.push(0b10_001_000);
  p.push(0b1_100_011_0);
  p.push(0b111_110_10);

  t.deepEqual(words, [0, 1, 2, 3, 4, 5, 6, 7]);
});

test('parses half-bytes', (t) => {
  const words = [];
  class Parser extends ParserBase {
    *parse() {
      while (true) {
        words.push(yield 4);
      }
    }
  }

  const p = new Parser();

  p.push(0x12);
  p.push(0x34);
  p.push(0x56);

  t.deepEqual(words, [2, 1, 4, 3, 6, 5]);
});

test('parses bytes', (t) => {
  const bytes = [];
  class Parser extends ParserBase {
    *parse() {
      while (true) {
        bytes.push(yield 8);
      }
    }
  }

  const p = new Parser();

  p.push(1);
  p.push(2);
  p.push(3);

  t.deepEqual(bytes, [1, 2, 3]);
});

test('parses LE words', (t) => {
  const words = [];
  class Parser extends ParserBase {
    *parse() {
      while (true) {
        words.push(yield 16);
      }
    }
  }

  const p = new Parser();

  p.push(1);
  p.push(2);
  p.push(3);
  p.push(4);

  t.deepEqual(words, [0x0201, 0x0403]);
});
