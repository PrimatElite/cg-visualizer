import * as THREE from 'three';
import Element from './Element';
import Point, { Coord } from './Point';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';
import {
  ExtendedNumber,
  LineCoefficients,
  processCoord,
  getLeftPartLineEquation,
  error,
} from '../Utils/utils';

type LineDirection = 'forward' | 'reverse';

export default class Line extends Element {
  readonly coefficients: LineCoefficients;
  readonly p1: Point | undefined;
  readonly p2: Point | undefined;
  readonly direction: LineDirection;

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
  }

  static fromEquation(
    coefficients: [ExtendedNumber, ExtendedNumber, ExtendedNumber],
    direction: LineDirection,
  ): Line {
    const lineCoefficients: LineCoefficients = [
      processCoord(coefficients[0]),
      processCoord(coefficients[1]),
      processCoord(coefficients[2]),
    ];
    return new Line(lineCoefficients, undefined, undefined, direction);
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

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;

    const equationStr = `${getLeftPartLineEquation(this.coefficients)}=0`;
    const equation = createAccordionItem(
      newId,
      'equation',
      `Equation: ${equationStr}`,
      `${id}_equation`,
    );

    let directionStr;
    if (this.direction === 'forward') {
      directionStr = `(${this.coefficients[1]
        .neg()
        .toFraction()}, ${this.coefficients[0].toFraction()})`;
    } else {
      directionStr = `(${this.coefficients[1].toFraction()}, ${this.coefficients[0]
        .neg()
        .toFraction()})`;
    }
    const direction = createAccordionItem(
      newId,
      'direction',
      `Direction: ${directionStr}`,
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
    if (this.coefficients[0].equals(0) && this.coefficients[1].equals(0)) {
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
    if (this.coefficients[0].equals(0) && this.coefficients[1].equals(0)) {
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

  getDistanceToPoint(p: Point) {
    if (this.coefficients[0].equals(0) && this.coefficients[1].equals(0)) {
      return undefined;
    }
    const d = Math.sqrt(
      this.coefficients[0].pow(2).add(this.coefficients[1]).pow(2).valueOf(),
    );
    const v = this.coefficients[0]
      .mul(p.x)
      .add(this.coefficients[1].mul(p.y))
      .add(this.coefficients[2]);
    if (v.equals(0)) {
      return 0;
    }
    return v.abs().valueOf() / d;
  }
}
