"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.varint_decode = exports.varint_encode = void 0;
const MSB = 0x80n // 0x80    1000 0000
, REST = 0x7fn // 0x7F    0111 1111
, BYTE = 0xffn // 0xFF
, MSBALL = ~REST;
function int_to_buffer(value) {
    const buffer = Buffer.allocUnsafe(16);
    // convert bigint to buffer, using big-endian byte order (high byte first)
    if (value > 0xffffffffffffffffn) {
        buffer.writeBigUInt64BE(value >> 64n, 0);
        buffer.writeBigUInt64BE(value & 0xffffffffffffffffn, 8);
    }
    else {
        buffer.writeBigUInt64BE(value & 0xffffffffffffffffn, 8);
    }
    return buffer;
}
function encode_to_vec(value) {
    // if( typeof(value) !== 'bigint') value = BigInt(value)
    const buff = [];
    while (value >> 7n > 0) {
        buff.push(int_to_buffer(value).readUInt8(15) | 0x80);
        value >>= 7n;
    }
    buff.push(int_to_buffer(value).readUInt8(15));
    return buff;
}
function varint_encode(value, buff) {
    const new_buff = encode_to_vec(value);
    // console.log( value, new_buff)
    new_buff.forEach((v, i) => {
        buff.push(v);
    });
}
exports.varint_encode = varint_encode;
function varint_decode(buff) {
    console.error(`Not implemented yet!`);
    return 0n;
}
exports.varint_decode = varint_decode;
