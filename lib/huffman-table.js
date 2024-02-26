export default class HuffmanTable {
  #config;

  constructor(config) {
    this.#config = config;
    this.minPrefix = 0;

    for (let i = 0; i < config.length; i += 1) {
      if (config[i].values.length) {
        this.minPrefix = i + 1;
        break;
      }
    }
  }

  lookup(code, len) {
    if (len < this.minPrefix) {
      return null;
    }

    const page = this.#config[len - 1];
    if (!page) {
      throw new Error(`Table overflow at: ${len}, ${code.toString(2)}`);
    }
    if (!(page.start <= code && code < page.end)) {
      return null;
    }
    return page.values[code - page.start];
  }

  static createConfig(pairs, sort = false) {
    if (pairs.length % 2 !== 0) {
      throw new Error('Odd number of pairs');
    }

    // See RFC1951 Section 3.2.2

    const blCount = [0];
    for (let i = 0; i < pairs.length; i += 2) {
      const bits = pairs[i + 1];

      while (blCount.length <= bits) {
        blCount.push(0);
      }
      blCount[bits] += 1;
    }

    let code = 0;
    const pages = [];
    for (let bits = 1; bits < blCount.length; bits += 1) {
      // eslint-disable-next-line no-bitwise
      code = (code + blCount[bits - 1]) << 1;
      pages.push({ start: code, end: code, values: [] });
    }

    for (let i = 0; i < pairs.length; i += 2) {
      const byte = pairs[i];
      const bits = pairs[i + 1];
      const page = pages[bits - 1];
      page.values.push(byte);
      page.end += 1;
    }

    if (sort) {
      for (const page of pages) {
        page.values.sort((a, b) => a - b);
      }
    }

    return pages;
  }

  static fromPairs(pairs, sort = false) {
    return new HuffmanTable(HuffmanTable.createConfig(pairs, sort));
  }
}
