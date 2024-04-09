function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import Script from "btc-script-builder-thords";
import { varint_encode } from "./varint";
var MAGIC_NUMBER = 0x5d; // 93
var MAX_SCRIPT_ELEMENT_SIZE = 520;
export var Tags = {
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
  // burn, unused

  Divisibility: 1n,
  Spacers: 3n,
  Symbol: 5n,
  Nop: 127n //unused
};
export var FLAGS = {
  Etching: 0n,
  Terms: 1n,
  Cenotaph: 127n
};
var STEPS = [0n, 26n, 702n, 18278n, 475254n, 12356630n, 321272406n, 8353082582n, 217180147158n, 5646683826134n, 146813779479510n, 3817158266467286n, 99246114928149462n, 2580398988131886038n, 67090373691429037014n, 1744349715977154962390n, 45353092615406029022166n, 1179180408000556754576342n, 30658690608014475618984918n, 797125955808376366093607894n, 20725274851017785518433805270n, 538857146126462423479278937046n, 14010285799288023010461252363222n, 364267430781488598271992561443798n, 9470953200318703555071806597538774n, 246244783208286292431866971536008150n, 6402364363415443603228541259936211926n, 166461473448801533683942072758341510102n];
var SUBSIDY_HALVING_INTERVAL = 210000n;
function bail(msg) {
  throw new Error(msg);
}
export var Flag = {
  mask: function mask(flag) {
    return 1n << flag;
  },
  set: function set(flag, v) {
    return v |= this.mask(flag);
  },
  take: function take(flag, v) {
    var masked = this.mask(flag);
    var set = (v & masked) != 0n;
    v &= masked ^ 255n;
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
export function str_to_int(str) {
  var x = 0n;
  str.split('').forEach(function (c, i) {
    if (i > 0n) x += 1n;
    x = x * 26n;
    var v = c.charCodeAt(0);
    if (v >= 65 && v <= 90) {
      x = x + BigInt(v - 65);
    } else {
      bail("invalid character in rune name: " + v);
    }
  });
  return x;
}
export function first_rune_height(network) {
  network = network || 'testnet';
  if (network === 'mainnet') {
    return SUBSIDY_HALVING_INTERVAL * 4n;
  } else if (network === 'testnet') {
    return SUBSIDY_HALVING_INTERVAL * 12n;
  }
  return 0n;
}
export function minimum_at_height(height) {
  var offset = BigInt(height) + 1n;
  var INTERVAL = SUBSIDY_HALVING_INTERVAL / 12n;
  var start = first_rune_height('testnet');
  var end = start + SUBSIDY_HALVING_INTERVAL;
  if (offset < start) return STEPS[12];
  if (offset >= end) return STEPS[0];
  var progress = offset - start;
  var length = 12n - progress / INTERVAL;
  end = STEPS[Number(length - 1n)];
  start = STEPS[Number(length)];
  var remainder = progress % INTERVAL;
  return start - (start - end) * remainder / INTERVAL;
}
export function format_rune_id(rune_id) {
  var height = rune_id >> 16n;
  var index = rune_id & 0xFFFFn;
  return new RuneId(height, index);
}
export function encode_to_vec(tag, values, payload) {
  if (values[0] === null || typeof values[0] === 'undefined') return [];
  values.forEach(function (v) {
    varint_encode(tag, payload);
    varint_encode(v, payload);
  });
  return payload;
}
export var SpacedRune = /*#__PURE__*/function () {
  function SpacedRune(rune, spacers) {
    this.rune = rune;
    this.spacers = spacers;
  }
  SpacedRune.format = function format(str) {
    var rune = [];
    var spacers = 0;
    for (var _iterator = _createForOfIteratorHelperLoose(str), _step; !(_step = _iterator()).done;) {
      var c = _step.value;
      if (c >= 'A' && c <= 'Z') {
        rune.push(c);
      } else if (c === '•' || c === '.') {
        if (rune.length === 0) bail('trailing spacer 1');
        if (rune.length === str.length - 1) bail('trailing spacer 2');
        var flag = 1 << rune.length - 1;
        if ((spacers & flag) != 0) bail('double spacer');
        spacers |= flag;
      } else {
        bail('invalid character');
      }
    }
    return new SpacedRune(rune.join(''), spacers);
  };
  var _proto = SpacedRune.prototype;
  _proto.display = function display() {
    var rune = this.rune,
      spacers = this.spacers;
    var formated = [];
    rune.split('').forEach(function (v, i) {
      formated.push(v);
      if (i < rune.length - 1 && (spacers & 1 << i) != 0) {
        formated.push('•');
      }
    });
    return formated.join('');
  };
  return SpacedRune;
}();
export var RuneId = /*#__PURE__*/function () {
  function RuneId(height, index) {
    this.height = height;
    this.index = index;
  }
  RuneId.from_str = function from_str(str) {
    var split_v = str.split(':');
    var height = BigInt(split_v[0]);
    var index = BigInt(split_v[1]);
    return new RuneId(height, index);
  };
  RuneId.from_bigint = function from_bigint(rune_id) {
    var height = rune_id >> 16n;
    var index = rune_id & 0xFFFFn;
    return new RuneId(height, index);
  };
  RuneId["default"] = function _default() {
    return new RuneId(0n, 0n);
  };
  var _proto2 = RuneId.prototype;
  _proto2.delta = function delta(next) {
    var height = next.height - this.height;
    var index = next.index;
    if (height === 0n) next.index - this.index;
    return new RuneId(height, index);
  };
  _proto2.next = function next(block, index) {
    var height = this.height + block;
    if (height === 0n) index = this.index + index;
    return new RuneId(height, index);
  };
  _proto2.parse = function parse() {
    // const split_v = rune_id.split(':')
    // const height = BigInt(split_v[0])
    // const index = BigInt(split_v[1])
    var height = this.height,
      index = this.index;
    return height << 16n | index;
  };
  return RuneId;
}();
export var Runestone = /*#__PURE__*/function () {
  function Runestone(opt) {
    this.cenotaph = opt.cenotaph;
    this.edicts = opt.edicts;
    this.etching = opt.etching;
    this.mint = opt.mint;
    this.pointer = opt.pointer;
  }
  var _proto3 = Runestone.prototype;
  _proto3.encipher = function encipher() {
    var cenotaph = this.cenotaph,
      edicts = this.edicts,
      etching = this.etching,
      mint = this.mint,
      pointer = this.pointer;
    var payload = [];
    if (etching) {
      var divisibility = etching.divisibility,
        premine = etching.premine,
        rune = etching.rune,
        spacers = etching.spacers,
        symbol = etching.symbol,
        terms = etching.terms;
      var flags = Flag.set(FLAGS.Etching, 0n);
      if (terms) {
        flags = Flag.set(FLAGS.Terms, flags);
      }
      encode_to_vec(Tags.Flags, [flags], payload);
      encode_to_vec(Tags.Rune, [str_to_int(rune)], payload);
      encode_to_vec(Tags.Divisibility, [BigInt(divisibility || 0)], payload);
      encode_to_vec(Tags.Spacers, [BigInt(spacers || 0)], payload);
      encode_to_vec(Tags.Symbol, [BigInt(symbol || 0)], payload);
      encode_to_vec(Tags.Premine, [premine || 0n], payload);
      if (terms) {
        var amount = terms.amount,
          cap = terms.cap,
          start_height = terms.start_height,
          end_height = terms.end_height,
          start_offset = terms.start_offset,
          end_offset = terms.end_offset;
        encode_to_vec(Tags.Amount, [amount || 0n], payload);
        encode_to_vec(Tags.Cap, [cap || 0n], payload);
        encode_to_vec(Tags.HeightStart, [BigInt(start_height || 0)], payload);
        encode_to_vec(Tags.HeightEnd, [BigInt(end_height || 0)], payload);
        encode_to_vec(Tags.OffsetStart, [BigInt(start_offset || 0)], payload);
        encode_to_vec(Tags.OffsetEnd, [BigInt(end_offset || 0)], payload);
      }
    }
    if (mint) {
      encode_to_vec(Tags.Mint, [mint.height, mint.index], payload);
    }
    if (pointer) {
      encode_to_vec(Tags.Pointer, [BigInt(pointer || 0)], payload);
    }
    if (cenotaph) {
      varint_encode(Tags.Cenotaph, payload);
      varint_encode(0n, payload);
    }
    if (edicts) {
      varint_encode(Tags.Body, payload);
      var sorted_edicts = edicts.sort(function (a, b) {
        return a.id >= b.id ? 1 : -1;
      });
      var previous = RuneId["default"]();
      sorted_edicts.forEach(function (edict) {
        var output = previous.delta(edict.id);
        varint_encode(output.height, payload);
        varint_encode(output.index, payload);
        varint_encode(edict.amount, payload);
        varint_encode(BigInt(edict.output), payload);
        previous = edict.id;
      });
    }
    if (payload.length > MAX_SCRIPT_ELEMENT_SIZE) {
      bail("script too large: " + payload.length + " bytes, needs to be less than " + MAX_SCRIPT_ELEMENT_SIZE + " bytes");
    }
    var output_buff = Buffer.from(payload);
    var output_script = new Script();
    var script_buff = output_script.addOp("OP_RETURN").addByte(MAGIC_NUMBER).addData(output_buff).compile();
    return script_buff;
  };
  return Runestone;
}();