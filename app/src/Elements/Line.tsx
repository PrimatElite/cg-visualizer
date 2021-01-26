import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import Point, { Coord } from './Point';
import Segment from './Segment';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';
import {
  ExtendedNumber,
  LineCoefficients,
  processCoord,
  getLeftPartLineEquation,
  error,
} from '../Utils/utils';

export type LineDirection = 'forward' | 'reverse';

export default class Line extends Element {
  readonly coefficients: LineCoefficients;
  readonly p1: Point | undefined;
  readonly p2: Point | undefined;
  readonly direction: LineDirection;
  readonly isUndefined: boolean;

  private constructor(
    coefficients: LineCoefficients,
    p1: Point | undefined,
    p2: Point | undefined,
    direction: LineDirection,
  ) {
    super('line');
    this.coefficients = coefficients;
    this.direction = direction;
    this.p1 = p1;
    this.p2 = p2;
    this.isUndefined =
      this.coefficients[0].equals(0) && this.coefficients[1].equals(0);
  }

  static fromEquation(
    coefficients: [ExtendedNumber, ExtendedNumber, ExtendedNumber],
    direction: LineDirection = 'forward',
  ): Line {
    const lineCoefficients: LineCoefficients = [
      processCoord(coefficients[0]),
      processCoord(coefficients[1]),
      processCoord(coefficients[2]),
    ];
    return new Line(lineCoefficients, undefined, undefined, direction);
  }

  static fromPointNormal(point: Point, normal: Point): Line {
    const lineCoefficients: LineCoefficients = [
      normal.x.neg(),
      normal.y.neg(),
      normal.x.mul(point.x).add(normal.y.mul(point.y)),
    ];
    return new Line(lineCoefficients, undefined, undefined, 'forward');
  }

  static fromSide(side: [Point, Point]): Line {
    const coefficients: LineCoefficients = [
      side[1].y.sub(side[0].y),
      side[0].x.sub(side[1].x),
      side[1].x.mul(side[0].y).sub(side[0].x.mul(side[1].y)),
    ];
    return new Line(coefficients, side[0], side[1], 'forward');
  }

  static fromCoords(coords1: Coord, coords2: Coord): Line {
    return Line.fromSide([
      Point.fromCoords(coords1),
      Point.fromCoords(coords2),
    ]);
  }

  getDirectionPoint(): Point {
    if (this.direction === 'forward') {
      return Point.fromCoords([
        this.coefficients[1].neg(),
        this.coefficients[0],
      ]);
    } else {
      return Point.fromCoords([
        this.coefficients[1],
        this.coefficients[0].neg(),
      ]);
    }
  }

  getNormalPoint(): Point {
    const dir = this.getDirectionPoint();
    return Point.fromCoords([dir.y.neg(), dir.x]);
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;

    const equationStr = `${getLeftPartLineEquation(this.coefficients)}=0`;
    const equation = createAccordionItem(
      newId,
      'equation',
      this.isUndefined ? 'Line is undefined' : `Equation: ${equationStr}`,
      `${id}_equation`,
    );

    const dir = this.getDirectionPoint();
    const direction = createAccordionItem(
      newId,
      'direction',
      `Direction: (${dir.x.toFraction()}, ${dir.y.toFraction()})`,
      `${id}_direction`,
    );

    let body;
    if (this.p1 && this.p2) {
      const point1 = this.p1.info('point1', newId, `${id}_point1`);
      const point2 = this.p2.info('point2', newId, `${id}_point2`);
      body = createAccordion(newId, [equation, direction, point1, point2]);
    } else {
      body = createAccordion(newId, [equation, direction]);
    }
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    if (this.isUndefined) {
      return false;
    }
    let point1 = this.p1,
      point2 = this.p2;
    if (point1 === undefined || point2 === undefined) {
      if (this.coefficients[1].equals(0)) {
        const x = this.coefficients[2].neg().div(this.coefficients[0]);
        point1 = Point.fromCoords([x, 0]);
        point2 = Point.fromCoords([x, 1]);
      } else {
        const k = this.coefficients[0].neg().div(this.coefficients[1]);
        const b = this.coefficients[2].neg().div(this.coefficients[1]);
        point1 = Point.fromCoords([0, b]);
        point2 = Point.fromCoords([1, k.add(b)]);
      }
    }

    const left = Math.floor(rectangle.getLeft()),
      right = Math.ceil(rectangle.getRight());
    const top = Math.ceil(rectangle.getTop()),
      bottom = Math.floor(rectangle.getBottom());
    const corners = [
      Point.fromCoords([left, top]),
      Point.fromCoords([left, bottom]),
      Point.fromCoords([right, bottom]),
      Point.fromCoords([right, top]),
    ];
    const vertices = [...corners, corners[0]];
    let areaSign1, areaSign2;
    for (let i = 0; i < 4; i++) {
      areaSign1 = Point.triangleArea(point1, point2, vertices[i]).compare(0);
      areaSign2 = Point.triangleArea(point1, point2, vertices[i + 1]).compare(
        0,
      );
      if (
        (areaSign1 !== areaSign2 && areaSign1 !== 0 && areaSign2 !== 0) ||
        (areaSign1 === 0 && areaSign2 === 0)
      ) {
        return true;
      }
    }
    return false;
  }

  draw(rectangle: RectangleView) {
    let point1, point2;
    if (this.isUndefined) {
      if (this.p1 && this.p2) {
        point1 = this.p1;
        point2 = this.p2;
      } else {
        return error("Line can't be drawn");
      }
    } else {
      const left = Math.floor(rectangle.getLeft()),
        right = Math.ceil(rectangle.getRight());
      const top = Math.ceil(rectangle.getTop()),
        bottom = Math.floor(rectangle.getBottom());

      if (this.coefficients[1].equals(0)) {
        const x = this.coefficients[2].neg().div(this.coefficients[0]);
        point1 = Point.fromCoords([x, bottom]);
        point2 = Point.fromCoords([x, top]);
      } else {
        const k = this.coefficients[0].neg().div(this.coefficients[1]);
        const b = this.coefficients[2].neg().div(this.coefficients[1]);
        point1 = Point.fromCoords([left, k.mul(left).add(b)]);
        point2 = Point.fromCoords([right, k.mul(right).add(b)]);
      }
    }

    const path = new THREE.Path(
      [point1, point2].map(
        (p) => new THREE.Vector2(p.x.valueOf(), p.y.valueOf()),
      ),
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    const material = new THREE.LineBasicMaterial({
      color: this._color,
      linewidth: 2,
    });
    return new THREE.Line(geometry, material);
  }

  getLineValue(p: Point): Fraction {
    return this.coefficients[0]
      .mul(p.x)
      .add(this.coefficients[1].mul(p.y))
      .add(this.coefficients[2]);
  }

  getDistanceToPoint(p: Point): number | undefined {
    if (this.isUndefined) {
      return undefined;
    }
    const d = Math.sqrt(
      this.coefficients[0].pow(2).add(this.coefficients[1]).pow(2).valueOf(),
    );
    const v = this.getLineValue(p);
    if (v.equals(0)) {
      return 0;
    }
    return v.abs().valueOf() / d;
  }

  intersectWithPoint(point: Point): Point | undefined {
    if (this.isUndefined) {
      return undefined;
    }
    if (this.getLineValue(point).equals(0)) {
      return point;
    }
    return undefined;
  }

  intersectWithLine(line: Line): Point | undefined {
    const D = this.coefficients[0]
      .mul(line.coefficients[1])
      .sub(line.coefficients[0].mul(this.coefficients[1]));
    if (!D.equals(0)) {
      const Dx = this.coefficients[1]
        .mul(line.coefficients[2])
        .sub(line.coefficients[1].mul(this.coefficients[2]));
      const Dy = this.coefficients[2]
        .mul(line.coefficients[0])
        .sub(line.coefficients[2].mul(this.coefficients[0]));
      return Point.fromCoords([Dx.div(D), Dy.div(D)]);
    }
    return undefined;
  }

  intersectWithSegment(segment: Segment): Point | undefined {
    if (this.isUndefined) {
      return undefined;
    } else if (segment.isPoint) {
      return this.intersectWithPoint(segment.p1);
    } else {
      const point = this.intersectWithLine(
        Line.fromCoords(segment.p1, segment.p2),
      );
      if (point) {
        return segment.intersectWithPoint(point);
      }
    }
    return undefined;
  }
}
