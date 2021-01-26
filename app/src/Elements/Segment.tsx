import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import Point, { Coord } from './Point';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';

export default class Segment extends Element {
  readonly p1: Point;
  readonly p2: Point;
  readonly length: number;
  readonly isPoint: boolean;

  private constructor(p1: Point, p2: Point) {
    super('segment');
    this.p1 = p1;
    this.p2 = p2;
    this.length = this.p1.getDistanceToPoint(this.p2);
    this.isPoint = this.p1.equals(this.p2);
  }

  static fromSide(side: [Point, Point]): Segment {
    return new Segment(side[0], side[1]);
  }

  static fromCoords(coords1: Coord, coords2: Coord): Segment {
    return new Segment(Point.fromCoords(coords1), Point.fromCoords(coords2));
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const point1 = this.p1.info('point1', newId, `${id}_point1`);
    const point2 = this.p2.info('point2', newId, `${id}_point2`);
    const length = createAccordionItem(
      newId,
      'length',
      `Length: ${this.length}`,
      `${id}_length`,
    );
    const body = createAccordion(newId, [length, point1, point2]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    return this.p1.inRectangle(rectangle) || this.p2.inRectangle(rectangle);
  }

  draw(rectangle: RectangleView) {
    const path = new THREE.Path(
      [this.p1, this.p2].map(
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

  intersectWithPoint(point: Point): Point | undefined {
    if (this.isPoint) {
      if (point.equals(this.p1)) {
        return point;
      }
    } else if (Point.triangleArea(this.p1, this.p2, point).equals(0)) {
      let t = new Fraction(2);
      if (this.p1.x.equals(this.p2.x)) {
        t = point.y.sub(this.p1.y).div(this.p2.y.sub(this.p1.y));
      } else {
        t = point.x.sub(this.p1.x).div(this.p2.x.sub(this.p1.x));
      }
      if (t.compare(0) >= 0 && t.compare(1) <= 0) {
        return point;
      }
    }
    return undefined;
  }

  intersectWithSegment(segment: Segment): Point | undefined {
    const dir1 = this.p2.sub(this.p1),
      dir2 = segment.p1.sub(segment.p2),
      dir3 = segment.p1.sub(this.p1);
    const D = dir1.x.mul(dir2.y).sub(dir2.x.mul(dir1.y));

    if (D.equals(0)) {
      if (
        (this.p1.equals(segment.p1) && !this.p2.equals(segment.p2)) ||
        (this.p1.equals(segment.p2) && !this.p2.equals(segment.p1))
      ) {
        return this.p1;
      } else if (
        (this.p2.equals(segment.p1) && !this.p1.equals(segment.p2)) ||
        (this.p2.equals(segment.p2) && !this.p1.equals(segment.p1))
      ) {
        return this.p2;
      }
    } else {
      const D1 = dir3.x.mul(dir2.y).sub(dir2.x.mul(dir3.y));
      const t = D1.div(D);
      if (t.compare(0) >= 0 && t.compare(1) <= 0) {
        return this.p1.add(dir1.multiplyScalar(t));
      }
    }
    return undefined;
  }
}
