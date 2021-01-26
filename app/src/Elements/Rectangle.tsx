import Element from './Element';
import Point from './Point';
import Polygon from './Polygon';
import Segment from './Segment';
import Line from './Line';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';
import { error } from '../Utils/utils';

type ExtremePoints = [Point, Point, Point];

export default class Rectangle extends Element {
  readonly rectangle: Polygon | undefined;
  readonly segment: Segment | undefined;
  readonly line: Line;
  readonly points: ExtremePoints;

  private constructor(
    rectangle: Polygon | undefined,
    segment: Segment | undefined,
    line: Line,
    points: ExtremePoints,
  ) {
    super('rectangle');
    this.rectangle = rectangle;
    this.segment = segment;
    this.line = line;
    this.points = points;
    if (this.rectangle) {
      this.rectangle.color = this.color;
    }
  }

  private static _getPolygon(
    line: Line,
    points: ExtremePoints,
  ): Polygon | undefined {
    if (line.isUndefined || line.intersectWithPoint(points[1]) !== undefined) {
      return undefined;
    }

    const normal = line.getNormalPoint();
    const parLine = Line.fromPointNormal(points[1], normal);
    const perNormal = line.getDirectionPoint();
    const beginLine = Line.fromPointNormal(points[0], perNormal);
    const endLine = Line.fromPointNormal(points[2], perNormal);

    const vertices = [
      line.intersectWithLine(beginLine),
      beginLine.intersectWithLine(parLine),
      parLine.intersectWithLine(endLine),
      endLine.intersectWithLine(line),
    ];
    if (!vertices.includes(undefined)) {
      return Polygon.fromVertices(vertices as Array<Point>);
    }
    return undefined;
  }

  static fromLinePoints(line: Line, points: ExtremePoints): Rectangle {
    const rectangle = Rectangle._getPolygon(line, points);
    return new Rectangle(rectangle, undefined, line, points);
  }

  static fromSegmentPoints(segment: Segment, points: ExtremePoints): Rectangle {
    const line = Line.fromSide([segment.p1, segment.p2]);
    const rectangle = Rectangle._getPolygon(line, points);
    return new Rectangle(rectangle, segment, line, points);
  }

  static fromSidePoints(
    side: [Point, Point] | Segment | Line,
    points: ExtremePoints,
  ): Rectangle {
    if (side instanceof Array) {
      return Rectangle.fromSegmentPoints(Segment.fromSide(side), points);
    } else if (side instanceof Segment) {
      return Rectangle.fromSegmentPoints(side, points);
    } else {
      return Rectangle.fromLinePoints(side, points);
    }
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    let side;
    if (this.segment) {
      side = this.segment.info('side-segment', newId, `${id}_side`);
    } else {
      side = this.line.info('side-line', newId, `${id}_side`);
    }
    const points = this.points.map((p, ind) =>
      p.info(`point_${ind}`, newId, `${id}_${ind}`),
    );
    const area = createAccordionItem(
      newId,
      'area',
      this.rectangle === undefined
        ? 'Area is undefined'
        : `Area: ${this.rectangle.area}`,
      `${id}_area`,
    );
    const perimeter = createAccordionItem(
      newId,
      'perimeter',
      this.rectangle === undefined
        ? 'Perimeter is undefined'
        : `Perimeter: ${this.rectangle.perimeter}`,
      `${id}_perimeter`,
    );
    const body = createAccordion(newId, [area, perimeter, side, ...points]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    return (
      this.rectangle !== undefined && this.rectangle.inRectangle(rectangle)
    );
  }

  draw(rectangle: RectangleView) {
    if (this.rectangle === undefined) {
      return error("Rectangle can't be drawn");
    }
    return this.rectangle.draw(rectangle);
  }
}
