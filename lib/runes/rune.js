"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runestone = exports.RuneId = exports.SpacedRune = exports.encode_to_vec = exports.format_rune_id = exports.minimum_at_height = exports.first_rune_height = exports.str_to_int = exports.Flag = exports.FLAGS = exports.Tags = void 0;
const btc_script_builder_thords_1 = __importDefault(require("btc-script-builder-thords"));
const varint_1 = require("./varint");
const MAGIC_NUMBER = 0x5d; // 93
const MAX_SCRIPT_ELEMENT_SIZE = 520;
exports.Tags = {
    Body: 0n,
    Flags: 2n,
    Rune: 4n,
    Premine: 6n,
    Cap: 8n,
    Amount: 10n,
    HeightStart: 12n,
    HeightEnd: 14n,
    OffsetStart: 16n,
    OffsetEnd: 18n,
    Mint: 20n,
    Pointer: 22n,
    Cenotaph: 126n,
    Divisibility: 1n,
    Spacers: 3n,
    Symbol: 5n,
    Nop: 127n //unused
};
exports.FLAGS = {
    Etching: 0n,
    Terms: 1n,
    Cenotaph: 127n
};
const STEPS = [
    0n,
    26n,
    702n,
    18278n,
    475254n,
    12356630n,
    321272406n,
    8353082582n,
    217180147158n,
    5646683826134n,
    146813779479510n,
    3817158266467286n,
    99246114928149462n,
    2580398988131886038n,
    67090373691429037014n,
    1744349715977154962390n,
    45353092615406029022166n,
    1179180408000556754576342n,
    30658690608014475618984918n,
    797125955808376366093607894n,
    20725274851017785518433805270n,
    538857146126462423479278937046n,
    14010285799288023010461252363222n,
    364267430781488598271992561443798n,
    9470953200318703555071806597538774n,
    246244783208286292431866971536008150n,
    6402364363415443603228541259936211926n,
    166461473448801533683942072758341510102n,
];
const SUBSIDY_HALVING_INTERVAL = 210000n;
function bail(msg) {
    throw new Error(msg);
}
exports.Flag = {
    mask(flag) {
        return 1n << flag;
    },
    set(flag, v) {
        return v |= this.mask(flag);
    },
    take(flag, v) {
        const masked = this.mask(flag);
        const set = (v & masked) != 0n;
        v &= (masked ^ 255n);
        return set;
    }
};
// fn from_str(s: &str) -> Result<Self, Error> {
//     let mut x = 0u128;
//     for (i, c) in s.chars().enumerate() {
//       if i > 0 {
//         x += 1;
//       }
//       x = x.checked_mul(26).ok_or(Error::Range)?;
//       match c {
//         'A'..='Z' => {
//           x = x.checked_add(c as u128 - 'A' as u128).ok_or(Error::Range)?;
//         }
//         _ => return Err(Error::Character(c)),
//       }
//     }
//     Ok(Rune(x))
//   }
function str_to_int(str) {
    let x = 0n;
    str.split('').forEach((c, i) => {
        if (i > 0n)
            x += 1n;
        x = x * 26n;
        const v = c.charCodeAt(0);
        if (v >= 65 && v <= 90) {
            x = x + BigInt(v - 65);
        }
        else {
            bail(`invalid character in rune name: ${v}`);
        }
    });
    return x;
}
exports.str_to_int = str_to_int;
function first_rune_height(network) {
    network = network || 'testnet';
    if (network === 'mainnet') {
        return SUBSIDY_HALVING_INTERVAL * 4n;
    }
    else if (network === 'testnet') {
        return SUBSIDY_HALVING_INTERVAL * 12n;
    }
    return 0n;
}
exports.first_rune_height = first_rune_height;
function minimum_at_height(height) {
    const offset = BigInt(height) + 1n;
    const INTERVAL = SUBSIDY_HALVING_INTERVAL / 12n;
    let start = first_rune_height('testnet');
    let end = start + SUBSIDY_HALVING_INTERVAL;
    if (offset < start)
        return STEPS[12];
    if (offset >= end)
        return STEPS[0];
    const progress = offset - start;
    const length = 12n - (progress / INTERVAL);
    end = STEPS[Number(length - 1n)];
    start = STEPS[Number(length)];
    const remainder = progress % INTERVAL;
    return start - ((start - end) * remainder / INTERVAL);
}
exports.minimum_at_height = minimum_at_height;
function format_rune_id(rune_id) {
    const height = rune_id >> 16n;
    const index = rune_id & 0xffffn;
    return new RuneId(height, index);
}
exports.format_rune_id = format_rune_id;
function encode_to_vec(tag, values, payload) {
    if (values[0] === null || typeof (values[0]) === 'undefined')
        return [];
    values.forEach(v => {
        (0, varint_1.varint_encode)(tag, payload);
        (0, varint_1.varint_encode)(v, payload);
    });
    return payload;
}
exports.encode_to_vec = encode_to_vec;
class SpacedRune {
    constructor(rune, spacers) {
        this.rune = rune;
        this.spacers = spacers;
    }
    static format(str) {
        const rune = [];
        let spacers = 0;
        for (const c of str) {
            if (c >= 'A' && c <= 'Z') {
                rune.push(c);
            }
            else if (c === '•' || c === '.') {
                if (rune.length === 0)
                    bail('trailing spacer 1');
                if (rune.length === str.length - 1)
                    bail('trailing spacer 2');
                let flag = 1 << (rune.length - 1);
                if ((spacers & flag) != 0)
                    bail('double spacer');
                spacers |= flag;
            }
            else {
                bail('invalid character');
            }
        }
        return new SpacedRune(rune.join(''), spacers);
    }
    display() {
        const { rune, spacers } = this;
        const formated = [];
        rune.split('').forEach((v, i) => {
            formated.push(v);
            if (i < rune.length - 1 && (spacers & 1 << i) != 0) {
                formated.push('•');
            }
        });
        return formated.join('');
    }
}
exports.SpacedRune = SpacedRune;
class RuneId {
    constructor(height, index) {
        this.height = height;
        this.index = index;
    }
    static from_str(str) {
        const split_v = str.split(':');
        const height = BigInt(split_v[0]);
        const index = BigInt(split_v[1]);
        return new RuneId(height, index);
    }
    static from_bigint(rune_id) {
        const height = rune_id >> 16n;
        const index = rune_id & 0xffffn;
        return new RuneId(height, index);
    }
    static default() {
        return new RuneId(0n, 0n);
    }
    delta(next) {
        const height = next.height - this.height;
        let index = next.index;
        if (height === 0n)
            next.index - this.index;
        return new RuneId(height, index);
    }
    next(block, index) {
        const height = this.height + block;
        if (height === 0n)
            index = this.index + index;
        return new RuneId(height, index);
    }
    parse() {
        // const split_v = rune_id.split(':')
        // const height = BigInt(split_v[0])
        // const index = BigInt(split_v[1])
        const { height, index } = this;
        return height << 16n | index;
    }
}
exports.RuneId = RuneId;
class Runestone {
    constructor(opt) {
        this.cenotaph = opt.cenotaph;
        this.edicts = opt.edicts;
        this.etching = opt.etching;
        this.mint = opt.mint;
        this.pointer = opt.pointer;
    }
    encipher() {
        const { cenotaph, edicts, etching, mint, pointer } = this;
        const payload = [];
        if (etching) {
            let { divisibility, premine, rune, spacers, symbol, terms } = etching;
            let flags = exports.Flag.set(exports.FLAGS.Etching, 0n);
            if (terms) {
                flags = exports.Flag.set(exports.FLAGS.Terms, flags);
            }
            encode_to_vec(exports.Tags.Flags, [flags], payload);
            encode_to_vec(exports.Tags.Rune, [str_to_int(rune)], payload);
            encode_to_vec(exports.Tags.Divisibility, [BigInt(divisibility || 0)], payload);
            encode_to_vec(exports.Tags.Spacers, [BigInt(spacers || 0)], payload);
            encode_to_vec(exports.Tags.Symbol, [BigInt(symbol || 0)], payload);
            encode_to_vec(exports.Tags.Premine, [premine || 0n], payload);
            if (terms) {
                const { amount, cap, start_height, end_height, start_offset, end_offset } = terms;
                encode_to_vec(exports.Tags.Amount, [amount || 0n], payload);
                encode_to_vec(exports.Tags.Cap, [cap || 0n], payload);
                encode_to_vec(exports.Tags.HeightStart, [BigInt(start_height || 0)], payload);
                encode_to_vec(exports.Tags.HeightEnd, [BigInt(end_height || 0)], payload);
                encode_to_vec(exports.Tags.OffsetStart, [BigInt(start_offset || 0)], payload);
                encode_to_vec(exports.Tags.OffsetEnd, [BigInt(end_offset || 0)], payload);
            }
        }
        if (mint) {
            encode_to_vec(exports.Tags.Mint, [mint.height, mint.index], payload);
        }
        if (pointer) {
            encode_to_vec(exports.Tags.Pointer, [BigInt(pointer || 0)], payload);
        }
        if (cenotaph) {
            (0, varint_1.varint_encode)(exports.Tags.Cenotaph, payload);
            (0, varint_1.varint_encode)(0n, payload);
        }
        if (edicts) {
            (0, varint_1.varint_encode)(exports.Tags.Body, payload);
            const sorted_edicts = edicts.sort((a, b) => {
                return a.id >= b.id ? 1 : -1;
            });
            let previous = RuneId.default();
            sorted_edicts.forEach(edict => {
                const output = previous.delta(edict.id);
                (0, varint_1.varint_encode)(output.height, payload);
                (0, varint_1.varint_encode)(output.index, payload);
                (0, varint_1.varint_encode)(edict.amount, payload);
                (0, varint_1.varint_encode)(BigInt(edict.output), payload);
                previous = edict.id;
            });
        }
        if (payload.length > MAX_SCRIPT_ELEMENT_SIZE) {
            bail(`script too large: ${payload.length} bytes, needs to be less than ${MAX_SCRIPT_ELEMENT_SIZE} bytes`);
        }
        const output_buff = Buffer.from(payload);
        const output_script = new btc_script_builder_thords_1.default();
        const script_buff = output_script.addOp("OP_RETURN")
            .addByte(MAGIC_NUMBER)
            .addData(output_buff)
            .compile();
        return script_buff;
    }
}
exports.Runestone = Runestone;
