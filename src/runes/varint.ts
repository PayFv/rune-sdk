const MSB: bigint = 0x80n // 0x80    1000 0000
  , REST: bigint = 0x7Fn  // 0x7F    0111 1111
  , BYTE = 0xFFn  // 0xFF
  , MSBALL = ~REST

function int_to_buffer(value: bigint) : Buffer{
    const buffer = Buffer.allocUnsafe(16)
    // convert bigint to buffer, using big-endian byte order (high byte first)
    if( value > 0xFFFFFFFFFFFFFFFFn ) {
        buffer.writeBigUInt64BE(value >> 64n, 0);
        buffer.writeBigUInt64BE(value & 0xFFFFFFFFFFFFFFFFn ,8);
    } else {
        buffer.writeBigUInt64BE(value & 0xFFFFFFFFFFFFFFFFn ,8);
    }
    return buffer;
}

function encode_to_vec( value: bigint ): Array<number> {
    // if( typeof(value) !== 'bigint') value = BigInt(value)
    const buff = []

    while( value >> 7n > 0 ) {
        buff.push(
            int_to_buffer( value ).readUInt8(15) | 0x80
        )
        value >>= 7n
    }

    buff.push(
        int_to_buffer( value ).readUInt8(15)
    )

    return buff 
}

export function varint_encode( value: bigint, buff: Array<number> ) {
    const new_buff = encode_to_vec(value)
    // console.log( value, new_buff)
    new_buff.forEach( (v,i) => {
        buff.push(v)
    })
}

export function varint_decode( buff: Buffer ): bigint {
    console.error(`Not implemented yet!`)
    return 0n
}