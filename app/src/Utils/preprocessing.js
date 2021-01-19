import Point from "../Elements/Point";
import Polygon from "../Elements/Polygon";
import Paints from "../Elements/Paints";
import Segment from "../Elements/Segment";
import Vector from "../Elements/Vector";
import { getByRef } from "./schema";
import { isRef } from "./utils";

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

    if (value instanceof Array) {
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
            case 'segment_coords':
                for (const key of ['coords1', 'coords2']) {
                    if (isRef(value[key])) {
                        value[key] = processElementRef(elements, newData, value[key]);
                    }
                }
                newElement = new Segment(value);
                break;
            case 'segment_side':
                value.side = processElementRef(elements, newData, value.side);
                newElement = new Segment(value);
                break;
            case 'vector':
                for (const key of ['begin', 'end']) {
                    if (isRef(value[key])) {
                        value[key] = processElementRef(elements, newData, value[key]);
                    }
                }
                newElement = new Vector(value);
                break;
            default:
                throw new Error('Unsupported type'); // TODO delete this when all types will be described
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