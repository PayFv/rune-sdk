/// <reference types="node" />
export declare function varint_encode(value: bigint, buff: Array<number>): void;
export declare function varint_decode(buff: Buffer): bigint;
