import ParserBase from './parser-base.js';
import HuffmanTable from './huffman-table.js';
import {
  FIXED_LIT_CODES,
  FIXED_DIST_CODES,
  B_TYPE_UNCOMPRESSED,
  B_TYPE_FIXED,
  B_TYPE_DYNAMIC,
  MAX_COPY_DISTANCE,
  HUFFMAN_LEN_TABLE,
  HUFFMAN_DIST_TABLE,
  HUFFMAN_DYNAMIC_ALPHABET,
} from './constants.js';

const FIXED_LIT_TABLE = new HuffmanTable(FIXED_LIT_CODES);
const FIXED_DIST_TABLE = new HuffmanTable(FIXED_DIST_CODES);

export default class Inflate extends ParserBase {
  #stream = new Array(MAX_COPY_DISTANCE);

  #offset = 0;

  #onBlock;

  constructor({ onBlock }) {
    super();

    this.#stream.fill(0);
    this.#onBlock = onBlock;
  }

  *parse() {
    while (true) {
      // See RFC1951 Section 3.2.3
      const bFinal = yield 1;
      const bType = yield 2;

      if (bType === B_TYPE_UNCOMPRESSED) {
        this.align();

        yield* this.#parseUncompressed();
      } else if (bType === B_TYPE_FIXED) {
        yield* this.#parseWithTables(FIXED_LIT_TABLE, FIXED_DIST_TABLE);
      } else if (bType === B_TYPE_DYNAMIC) {
        yield* this.#parseDynamic();
      } else {
        throw new Error(`Unexpected block type: ${bType}`);
      }

      if (bFinal) {
        this.align();
        break;
      }
    }
  }

  *#parseUncompressed() {
    // See RFC1951 Section 3.2.4
    const len = yield 16;
    const nlen = yield 16;

    // eslint-disable-next-line no-bitwise
    if (len !== (~nlen & 0xffff)) {
      throw new Error('Invalid uncompressed length');
    }

    const block = new Array(len);
    for (let i = 0; i < len; i += 1) {
      const byte = yield 8;
      block[i] = byte;

      // TODO(indutny): is this hot?
      this.#addToStream(byte);
    }

    this.#onBlock(block);
  }

  *#parseWithTables(litTable, distTable) {
    let block = [];

    // See RFC1951 Section 3.2.6
    while (true) {
      const litCode = yield* this.#readHuffmanCode(litTable);

      // Literal
      if (litCode <= 255) {
        const literal = litCode;
        block.push(literal);

        this.#addToStream(literal);
        continue;
      }

      // End of block
      if (litCode === 256) {
        const copy = block;
        block = [];
        this.#onBlock(copy);
        break;
      }

      // Copying
      // TODO(indutny): overflow validation
      const lenData = HUFFMAN_LEN_TABLE[litCode];
      if (!lenData) {
        throw new Error(`Unsupported lit/length code: ${litCode}`);
      }

      const lenExtra = yield lenData.extra;
      const len = lenData.start + lenExtra;

      const distCode = yield* this.#readHuffmanCode(distTable);

      const distData = HUFFMAN_DIST_TABLE[distCode];
      if (!distData) {
        throw new Error(`Unsupported dist code: ${distCode}`);
      }
      const distExtra = yield distData.extra;
      const dist = distData.start + distExtra;

      let copyFrom =
        (this.#offset + this.#stream.length - dist) % this.#stream.length;
      for (let i = 0; i < len; i += 1) {
        const ch = this.#stream[copyFrom];
        block.push(ch);
        this.#addToStream(ch);

        copyFrom = (copyFrom + 1) % this.#stream.length;
      }
    }
  }

  *#parseDynamic() {
    // See RFC1951 Section 3.2.7
    const hLit = 257 + (yield 5);
    const hDist = 1 + (yield 5);
    const hCLen = 4 + (yield 4);

    const pairs = [];
    for (let i = 0; i < hCLen; i += 1) {
      const bits = yield 3;
      if (bits === 0) {
        continue;
      }

      const code = HUFFMAN_DYNAMIC_ALPHABET[i];
      pairs.push(code, bits);
    }

    const table = HuffmanTable.fromPairs(pairs, true);
    // TODO(indutny): technically only the last one value is required
    const stream = [];
    const litTable = yield* this.#readDynamicTable(hLit, stream, table);
    const distTable = yield* this.#readDynamicTable(hDist, stream, table);

    yield* this.#parseWithTables(litTable, distTable);
  }

  *#readDynamicTable(count, stream, table) {
    const initial = stream.length;
    while (stream.length < initial + count) {
      const code = yield* this.#readHuffmanCode(table);

      // See RFC1951 Section 3.2.7
      if (code <= 15) {
        stream.push(code);
      } else if (code === 16) {
        // TODO(indutny): overflow validation
        const repeat = 3 + (yield 2);
        const last = stream.at(-1);
        for (let j = 0; j < repeat; j += 1) {
          stream.push(last);
        }
      } else {
        let repeat;
        if (code === 17) {
          repeat = 3 + (yield 3);
        } else if (code === 18) {
          repeat = 11 + (yield 7);
        } else {
          throw new Error(`Unsupported dynamic code: ${code}`);
        }
        for (let j = 0; j < repeat; j += 1) {
          stream.push(0);
        }
      }
    }

    const pairs = [];
    for (let i = initial; i < stream.length; i += 1) {
      const bits = stream[i];
      if (bits === 0) {
        continue;
      }

      pairs.push(i - initial, bits);
    }

    return HuffmanTable.fromPairs(pairs);
  }

  *#readHuffmanCode(table) {
    let bits = 0;
    let code = 0;

    while (true) {
      const ch = table.lookup(code, bits);
      if (ch !== null) {
        return ch;
      }

      const bit = yield 1;

      // Note that this technically is an reverse encoding of the data
      // eslint-disable-next-line no-bitwise
      code <<= 1;
      // eslint-disable-next-line no-bitwise
      code |= bit;
      bits += 1;
    }
  }

  #addToStream(ch) {
    this.#stream[this.#offset] = ch;
    this.#offset = (this.#offset + 1) % this.#stream.length;
  }
}
