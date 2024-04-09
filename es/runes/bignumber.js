import { FixedNumber } from "@ethersproject/bignumber";
export function formatUnits(value, unit) {
  unit = Number(unit);
  return FixedNumber.fromValue(value, unit).toString();
}
export function parseUnits(value, unit) {
  value = value.toString();
  if (unit === 0) return BigInt(value);
  console.log(value, unit);
  return BigInt(FixedNumber.fromString(value, Number(unit))._hex);
}