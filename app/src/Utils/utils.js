import Fraction from "fraction.js";

export function processCoord(vertex) {
    if (typeof vertex === "object") {
        if (vertex instanceof Fraction) {
            return vertex;
        } else {
            return new Fraction(vertex.frac);
        }
    } else {
        return new Fraction(vertex);
    }
}

export function getMyColor(n, color=0xfffff) {
    return parseInt((n * color * 1000000).toString(16).slice(0, 6), 16);
}

export function toRadians(angle) {
    return angle * (Math.PI / 180);
}

export function isRef(obj) {
    return obj.$ref !== undefined;
}

export function triangleArea(p1, p2, p3) {
    const D = p1.x.mul(p2.y).add(p1.y.mul(p3.x)).add(p2.x.mul(p3.y))
        .sub(p2.y.mul(p3.x)).sub(p1.y.mul(p2.x)).sub(p3.y.mul(p1.x));
    return D.div(2);
}

function getLeftPartVariableLineEquation(coefficient, variable) {
    if (coefficient.compare(0) < 0) {
        return `${coefficient.toFraction()}${variable}`;
    } else if (coefficient.compare(0) > 0) {
        return `+${coefficient.toFraction()}${variable}`;
    } else {
        return '';
    }
}

export function getLeftPartLineEquation(coefficients, variables=['x', 'y', '']) {
    let equationStr = '';
    for (let i = 0; i < coefficients.length; i++) {
        equationStr += getLeftPartVariableLineEquation(coefficients[i], variables[i]);
    }
    return equationStr.startsWith('+') ? equationStr.slice(1) : equationStr;
}
