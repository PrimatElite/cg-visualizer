import HalfPlane from '../Elements/HalfPlane';
import Line from '../Elements/Line';
import MyBoolean from '../Elements/Boolean';
import MyNumber from '../Elements/Number';
import Paints from '../Elements/Paints';
import Point from '../Elements/Point';
import Polygon from '../Elements/Polygon';
import PolyLine from '../Elements/PolyLine';
import Segment from '../Elements/Segment';
import Vector from '../Elements/Vector';
import { getByRef } from './schema';
import { isRef } from './utils';

function processElementRef(elements, newData, value) {
  let item = getByRef(newData, value.$ref);
  if (!item) {
    const elKey = value.$ref.split('/')[2];
    newData.elements[elKey] = processElement(
      elements,
      newData,
      elements[elKey],
    );
    item = getByRef(newData, value.$ref);
  }
  return item;
}

function processElement(elements, newData, value) {
  let newElement;

  if (value instanceof Array) {
    newElement = value.map((el) => processElement(elements, newData, el));
  } else if (typeof value === 'boolean') {
    newElement = MyBoolean.fromBoolean(value);
  } else if (typeof value === 'number') {
    newElement = MyNumber.fromNumber(value);
  } else if (value.type) {
    switch (value.type) {
      case 'half-plane_coords':
        for (const key of ['coords1', 'coords2']) {
          if (isRef(value[key])) {
            value[key] = processElementRef(elements, newData, value[key]);
          }
        }
        newElement = HalfPlane.fromCoords(value.coords1, value.coords2);
        break;
      case 'half-plane_side':
        value.side = processElementRef(elements, newData, value.side);
        newElement = HalfPlane.fromSide(value.side);
        break;
      case 'half-plane_equation':
        newElement = HalfPlane.fromEquation(
          value.coefficients,
          value.direction || 'forward',
        );
        break;
      case 'line_coords':
        for (const key of ['coords1', 'coords2']) {
          if (isRef(value[key])) {
            value[key] = processElementRef(elements, newData, value[key]);
          }
        }
        newElement = Line.fromCoords(value.coords1, value.coords2);
        break;
      case 'line_side':
        value.side = processElementRef(elements, newData, value.side);
        newElement = Line.fromSide(value.side);
        break;
      case 'line_equation':
        newElement = Line.fromEquation(
          value.coefficients,
          value.direction || 'forward',
        );
        break;
      case 'paints':
        value.input = processElementRef(elements, newData, value.input);
        value.output = processElementRef(elements, newData, value.output);
        newElement = Paints.fromObjectsValues(value.input, value.output);
        break;
      case 'point':
        newElement = Point.fromCoords(value.coords);
        break;
      case 'polygon':
        value.src = processElementRef(elements, newData, value.src);
        newElement = Polygon.fromVertices(value.src);
        break;
      case 'polyline':
        value.src = processElementRef(elements, newData, value.src);
        newElement = PolyLine.fromPoints(value.src);
        break;
      case 'segment_coords':
        for (const key of ['coords1', 'coords2']) {
          if (isRef(value[key])) {
            value[key] = processElementRef(elements, newData, value[key]);
          }
        }
        newElement = Segment.fromCoords(value.coords1, value.coords2);
        break;
      case 'segment_side':
        value.side = processElementRef(elements, newData, value.side);
        newElement = Segment.fromSide(value.side);
        break;
      case 'vector':
        for (const key of ['begin', 'end']) {
          if (isRef(value[key])) {
            value[key] = processElementRef(elements, newData, value[key]);
          }
        }
        newElement = Vector.fromCoords(value.begin, value.end);
        break;
      default:
        throw new Error('Unsupported type'); // TODO delete this when all types will be described
    }
  } else {
    newElement = processElementRef(elements, newData, value);
  }

  return newElement;
}

export function processElements(data) {
  const newData = { elements: {}, visualizations: data.visualizations };

  for (const [key, value] of Object.entries(data.elements)) {
    if (!newData.elements[key]) {
      newData.elements[key] = processElement(data.elements, newData, value);
    }
  }

  return newData;
}
