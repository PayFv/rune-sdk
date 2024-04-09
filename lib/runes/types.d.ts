/// <reference types="node" />
export interface SpacedRuneType {
    rune: string;
    spacers: number;
    display(): string;
}
export interface RuneIdType {
    height: bigint;
    index: bigint;
    delta(next: RuneIdType): RuneIdType;
    next(block: bigint, index: bigint): RuneIdType;
}
export interface Edict {
    id: RuneIdType;
    amount: bigint;
    output: number;
}
export interface Terms {
    amount: bigint | undefined;
    cap: bigint | undefined;
    start_height: number | undefined;
    end_height: number | undefined;
    start_offset: number | undefined;
    end_offset: number | undefined;
}
export interface Etching {
    divisibility: number | undefined;
    premine: bigint | undefined;
    rune: string | undefined;
    spacers: number | undefined;
    symbol: number | undefined;
    terms: Terms | undefined;
}
export interface RunestoneType {
    cenotaph: boolean;
    edicts: Array<Edict>;
    etching: Etching | undefined;
    mint: RuneIdType | undefined;
    pointer: number | undefined;
    encipher(): Buffer;
}
