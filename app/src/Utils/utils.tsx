import Fraction from 'fraction.js';

interface RationalNumber {
  frac: [number, number];
  type: string;
}

export type ExtendedNumber = number | RationalNumber | Fraction;

export function processCoord(n: ExtendedNumber) {
  if (n instanceof Fraction) {
    return n;
  } else if (typeof n === 'number') {
    return new Fraction(n);
  } else {
    return new Fraction(n.frac);
  }
}

export function getMyColor(n: number, color = 0xfffff) {
  return parseInt((n * color * 1000000).toString(16).slice(0, 6), 16);
}

export function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

export function isRef(obj: any) {
  return obj.$ref !== undefined;
}

function getLeftPartVariableLineEquation(
  coefficient: Fraction,
  variable: string,
) {
  if (coefficient.compare(0) < 0) {
    if (coefficient.equals(-1)) {
      return `-${variable}`;
    }
    return `${coefficient.toFraction()}${variable}`;
  } else if (coefficient.compare(0) > 0) {
    if (coefficient.equals(1)) {
      return `+${variable}`;
    }
    return `+${coefficient.toFraction()}${variable}`;
  } else {
    return '';
  }
}

export type LineCoefficients = [Fraction, Fraction, Fraction];

export function getLeftPartLineEquation(
  coefficients: LineCoefficients,
  variables = ['x', 'y', ''],
) {
  let equationStr = '';
  for (let i = 0; i < coefficients.length; i++) {
    equationStr += getLeftPartVariableLineEquation(
      coefficients[i],
      variables[i],
    );
  }
  return equationStr.startsWith('+') ? equationStr.slice(1) : equationStr;
}

export function error(message: string): never {
  throw new Error(message);
}
