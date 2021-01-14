import Point from "../Elements/Point";
import Polygon from "../Elements/Polygon";
import Paints from "../Elements/Paints";
import { getByRef } from "./schema";

function processElementRef(elements, newData, value) {
    let item = getByRef(newData, value.$ref);
    if (!item) {
        const elKey = value.$ref.split('/')[2];
        newData.elements[elKey] = processElement(elements, newData, elements[elKey]);
        item = getByRef(newData, value.$ref);
    }
    return item;
}

function processElement(elements, newData, value) {
    let newElement;

    if (value.length !== undefined) {
        newElement = value.map(el => processElement(elements, newData, el));
    } else if (value.type) {
        switch (value.type) {
            case 'point':
                newElement = new Point(value);
                break;
            case 'polygon':
                value.src = processElementRef(elements, newData, value.src);
                newElement = new Polygon(value);
                break;
            case 'paints':
                value.input = processElementRef(elements, newData, value.input);
                value.output = processElementRef(elements, newData, value.output);
                newElement = new Paints(value);
                break;
            default:
                throw new Error('Unsupported type');
        }
    } else if (['boolean', 'number'].includes(typeof value)) {
        newElement = value;
    } else {
        newElement = processElementRef(elements, newData, value);
    }

    return newElement;
}

export function processElements(data) {
    const newData = {elements: {}, visualizations: data.visualizations};

    for (const [key, value] of Object.entries(data.elements)) {
        if (!newData.elements[key]) {
            newData.elements[key] = processElement(data.elements, newData, value);
        }
    }

    return newData;
}