"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUnits = exports.formatUnits = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
function formatUnits(value, unit) {
    unit = Number(unit);
    return bignumber_1.FixedNumber.fromValue(value, unit).toString();
}
exports.formatUnits = formatUnits;
function parseUnits(value, unit) {
    value = value.toString();
    if (unit === 0)
        return BigInt(value);
    console.log(value, unit);
    return BigInt(bignumber_1.FixedNumber.fromString(value, Number(unit))._hex);
}
exports.parseUnits = parseUnits;
