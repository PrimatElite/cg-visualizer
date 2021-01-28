import Element from './Element';
import Point from './Point';
import Segment from './Segment';
import Line from './Line';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';
import { error } from '../Utils/utils';

type IntersectionObject = Point | Segment | Line;

type ExtendedIntersectionObject = IntersectionObject | [Point, Point];

type IntersectionType = 'empty' | 'contact' | 'intersection';

export default class LineIntersection extends Element {
  readonly objects: Array<IntersectionObject>;
  readonly point: Point | undefined;
  readonly intersectionType: IntersectionType;

  private constructor(
    objects: Array<IntersectionObject>,
    intersectionType: IntersectionType,
    point: Point | undefined,
  ) {
    super('line_intersection');
    this.objects = objects;
    this.point = point;
    this.intersectionType = intersectionType;

    if (this.point) {
      this.point.color = this.color;
    }
  }

  private static _getIntersection(
    objects: Array<IntersectionObject>,
  ): Point | undefined {
    let point = undefined;
    const element = objects[0];

    let getIntersection;
    switch (element.type) {
      case 'point':
        getIntersection = (obj: IntersectionObject): Point | undefined => {
          switch (obj.type) {
            case 'point':
              return (obj as Point).equals(element as Point)
                ? (obj as Point)
                : undefined;
            case 'segment':
              return (obj as Segment).intersectWithPoint(element as Point);
            case 'line':
              return (obj as Line).intersectWithPoint(element as Point);
          }
        };
        break;
      case 'segment':
        getIntersection = (obj: IntersectionObject): Point | undefined => {
          switch (obj.type) {
            case 'point':
              return (element as Segment).intersectWithPoint(obj as Point);
            case 'segment':
              return (obj as Segment).intersectWithSegment(element as Segment);
            case 'line':
              return (obj as Line).intersectWithSegment(element as Segment);
          }
        };
        break;
      case 'line':
        getIntersection = (obj: IntersectionObject): Point | undefined => {
          switch (obj.type) {
            case 'point':
              return (element as Line).intersectWithPoint(obj as Point);
            case 'segment':
              return (element as Line).intersectWithSegment(obj as Segment);
            case 'line':
              return (obj as Line).intersectWithLine(element as Line);
          }
        };
        break;
      default:
        return undefined;
    }

    for (let i = 1; i < objects.length; i++) {
      const newPoint = getIntersection(objects[i]);
      if (!newPoint) {
        return undefined;
      } else {
        if (point && !point.equals(newPoint)) {
          return undefined;
        } else if (!point) {
          point = newPoint;
        }
      }
    }
    return point;
  }

  static fromObjectsType(
    objects: Array<ExtendedIntersectionObject>,
    intersectionType: IntersectionType = 'intersection',
  ): LineIntersection {
    const elements = objects.map((o) => {
      if (o instanceof Array) {
        return Segment.fromSide(o);
      }
      return o;
    });
    if (intersectionType === 'intersection') {
      const point = LineIntersection._getIntersection(elements);
      return new LineIntersection(elements, intersectionType, point);
    }
    return new LineIntersection(elements, intersectionType, undefined);
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const objectsId = `${id}_objects`;
    const objects = createAccordion(
      `${objectsId}_data`,
      this.objects.map((o, ind) =>
        o.info(`object_${ind}`, `${objectsId}_data`, `${objectsId}_${ind}`),
      ),
    );
    const intersectionType = createAccordionItem(
      newId,
      'intersection_type',
      this.intersectionType,
      `${id}_type`,
    );
    const children = [
      createAccordionItem(newId, 'objects', objects, objectsId),
      intersectionType,
    ];
    if (this.intersectionType === 'intersection') {
      let result;
      if (this.point) {
        result = this.point.info('intersection', newId, `${id}_intersection`);
      } else {
        result = createAccordionItem(
          newId,
          'intersection',
          'Undefined',
          `${id}_intersection`,
        );
      }
      children.push(result);
    }
    const body = createAccordion(newId, children);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    if (this.intersectionType === 'intersection' && this.point) {
      return this.point.inRectangle(rectangle);
    }
    return false;
  }

  draw(rectangle: RectangleView) {
    if (this.intersectionType === 'intersection' && this.point) {
      return this.point.draw(rectangle);
    }
    return error("Line intersection can't be drawn");
  }
}
