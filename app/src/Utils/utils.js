import Fraction from "fraction.js";

export function processCoord(vertex) {
    if (typeof vertex === "object") {
        return new Fraction(vertex.frac);
    } else {
        return new Fraction(vertex);
    }
}

export function getMyColor(n) {
    return parseInt((n * 0xfffff * 1000000).toString(16).slice(0, 6), 16);
}

export function toRadians(angle) {
    return angle * (Math.PI / 180);
}

export function isRef(obj) {
    return obj.$ref !== undefined;
}
