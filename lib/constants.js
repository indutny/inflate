// Block types

export const B_TYPE_UNCOMPRESSED = 0b00;
export const B_TYPE_FIXED = 0b01;
export const B_TYPE_DYNAMIC = 0b10;

function range(from, to) {
  const result = new Array(to - from + 1);
  for (let i = 0; i <= to - from; i += 1) {
    result[i] = i + from;
  }
  return result;
}

// Huffman Table Config

// RFC 1952 Section 3.2.6
export const FIXED_LIT_CODES = [
  { start: 0, end: 0, values: [] }, // 1 bits
  { start: 0, end: 0, values: [] }, // 2 bits
  { start: 0, end: 0, values: [] }, // 3 bits
  { start: 0, end: 0, values: [] }, // 4 bits
  { start: 0, end: 0, values: [] }, // 5 bits
  { start: 0, end: 0, values: [] }, // 6 bits
  { start: 0b0000000, end: 0b0011000, values: range(256, 279) }, // 7 bits
  {
    start: 0b00110000,
    end: 0b11001000,
    values: [...range(0, 143), ...range(280, 287)],
  }, // 8 bits
  {
    start: 0b110010000,
    end: 0b1000000000,
    values: range(144, 255),
  }, // 9 bits
];

export const FIXED_DIST_CODES = [
  { start: 0, end: 0, values: [] }, // 1 bits
  { start: 0, end: 0, values: [] }, // 2 bits
  { start: 0, end: 0, values: [] }, // 3 bits
  { start: 0, end: 0, values: [] }, // 4 bits
  { start: 0b00000, end: 0b100000, values: range(0, 31) }, // 5 bits
];

export const HUFFMAN_LEN_TABLE = {
  257: { extra: 0, start: 3 },
  258: { extra: 0, start: 4 },
  259: { extra: 0, start: 5 },
  260: { extra: 0, start: 6 },
  261: { extra: 0, start: 7 },
  262: { extra: 0, start: 8 },
  263: { extra: 0, start: 9 },
  264: { extra: 0, start: 10 },
  265: { extra: 1, start: 11 },
  266: { extra: 1, start: 13 },
  267: { extra: 1, start: 15 },
  268: { extra: 1, start: 17 },
  269: { extra: 2, start: 19 },
  270: { extra: 2, start: 23 },
  271: { extra: 2, start: 27 },
  272: { extra: 2, start: 31 },
  273: { extra: 3, start: 35 },
  274: { extra: 3, start: 43 },
  275: { extra: 3, start: 51 },
  276: { extra: 3, start: 59 },
  277: { extra: 4, start: 67 },
  278: { extra: 4, start: 83 },
  279: { extra: 4, start: 99 },
  280: { extra: 4, start: 115 },
  281: { extra: 5, start: 131 },
  282: { extra: 5, start: 163 },
  283: { extra: 5, start: 195 },
  284: { extra: 5, start: 227 },
  285: { extra: 0, start: 258 },
};

export const HUFFMAN_DIST_TABLE = [
  { extra: 0, start: 1 }, // 0
  { extra: 0, start: 2 }, // 1
  { extra: 0, start: 3 }, // 2
  { extra: 0, start: 4 }, // 3
  { extra: 1, start: 5 }, // 4
  { extra: 1, start: 7 }, // 5
  { extra: 2, start: 9 }, // 6
  { extra: 2, start: 13 }, // 7
  { extra: 3, start: 17 }, // 8
  { extra: 3, start: 25 }, // 9
  { extra: 4, start: 33 }, // 10
  { extra: 4, start: 49 }, // 11
  { extra: 5, start: 65 }, // 12
  { extra: 5, start: 97 }, // 13
  { extra: 6, start: 129 }, // 14
  { extra: 6, start: 193 }, // 15
  { extra: 7, start: 257 }, // 16
  { extra: 7, start: 385 }, // 17
  { extra: 8, start: 513 }, // 18
  { extra: 8, start: 769 }, // 19
  { extra: 9, start: 1025 }, // 20
  { extra: 9, start: 1537 }, // 21
  { extra: 10, start: 2049 }, // 22
  { extra: 10, start: 3073 }, // 23
  { extra: 11, start: 4097 }, // 24
  { extra: 11, start: 6145 }, // 25
  { extra: 12, start: 8193 }, // 26
  { extra: 12, start: 12289 }, // 27
  { extra: 13, start: 16385 }, // 28
  { extra: 13, start: 24577 }, // 29
];

export const MAX_COPY_DISTANCE = 32768;

export const HUFFMAN_DYNAMIC_ALPHABET = [
  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
];
