/// <reference types="node" />
import { RunestoneType, Edict, RuneIdType, Etching, SpacedRuneType } from "./types";
export declare const Tags: {
    Body: bigint;
    Flags: bigint;
    Rune: bigint;
    Premine: bigint;
    Cap: bigint;
    Amount: bigint;
    HeightStart: bigint;
    HeightEnd: bigint;
    OffsetStart: bigint;
    OffsetEnd: bigint;
    Mint: bigint;
    Pointer: bigint;
    Cenotaph: bigint;
    Divisibility: bigint;
    Spacers: bigint;
    Symbol: bigint;
    Nop: bigint;
};
export declare const FLAGS: {
    Etching: bigint;
    Terms: bigint;
    Cenotaph: bigint;
};
export declare const Flag: {
    mask(flag: bigint): bigint;
    set(flag: bigint, v: bigint): bigint;
    take(flag: bigint, v: bigint): boolean;
};
export declare function str_to_int(str: string): bigint;
export declare function first_rune_height(network: string): bigint;
export declare function minimum_at_height(height: number): bigint;
export declare function format_rune_id(rune_id: bigint): RuneId;
export declare function encode_to_vec(tag: bigint, values: Array<bigint>, payload: Array<number>): Array<number>;
export declare class SpacedRune implements SpacedRuneType {
    rune: string;
    spacers: number;
    constructor(rune: string, spacers: number);
    static format(str: string): SpacedRuneType;
    display(): string;
}
export declare class RuneId implements RuneIdType {
    height: bigint;
    index: bigint;
    constructor(height: bigint, index: bigint);
    static from_str(str: string): RuneIdType;
    static from_bigint(rune_id: bigint): RuneIdType;
    static default(): RuneId;
    delta(next: RuneIdType): RuneIdType;
    next(block: bigint, index: bigint): RuneIdType;
    parse(): bigint;
}
export declare class Runestone implements RunestoneType {
    cenotaph: boolean;
    edicts: Edict[];
    etching: Etching;
    mint: RuneIdType;
    pointer: number;
    constructor(opt: RunestoneType);
    encipher(): Buffer;
}
