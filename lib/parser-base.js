export default class ParserBase {
  #buffer = 0;

  #length = 0;

  #generator = this.parse();

  #waiting;

  constructor() {
    const start = this.#generator.next();
    if (start.done) {
      throw new Error('Parsing finished before it began');
    }
    if (typeof start.value !== 'number') {
      throw new Error('Parser did not request initial data');
    }
    this.#waiting = start.value;
  }

  push(byte) {
    if (this.#length > 24) {
      throw new Error('BitBuffer overflow');
    }

    // eslint-disable-next-line no-bitwise
    this.#buffer |= byte << this.#length;
    this.#length += 8;

    while (this.#length >= this.#waiting) {
      // eslint-disable-next-line no-bitwise
      const mask = (1 << this.#waiting) - 1;
      // eslint-disable-next-line no-bitwise
      const value = this.#buffer & mask;
      // eslint-disable-next-line no-bitwise
      this.#buffer >>>= this.#waiting;
      this.#length -= this.#waiting;

      const step = this.#generator.next(value);
      if (step.done) {
        if (this.#length !== 0) {
          throw new Error('Parsing terminated early');
        }
        this.#waiting = 0;
        break;
      }

      if (typeof step.value !== 'number') {
        throw new Error('Parser did not request data');
      }
      this.#waiting = step.value;
    }
  }

  align() {
    const delta = this.#length % 8;
    // eslint-disable-next-line no-bitwise
    this.#buffer >>>= delta;
    this.#length -= delta;
  }

  finish() {
    if (this.#length !== 0) {
      throw new Error(`Parser has unconsumed bits: ${this.#length}`);
    }
    if (this.#waiting !== 0) {
      throw new Error(`Parser has unfulfilled bits: ${this.#waiting}`);
    }
  }

  // Abstract

  // eslint-disable-next-line require-yield
  *parse() {
    throw new Error('Implement me');
  }
}
