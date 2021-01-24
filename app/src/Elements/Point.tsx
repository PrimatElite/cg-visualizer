import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import RectangleView from '../Components/Canvas/RectangleView';
import { ExtendedNumber, processCoord } from '../Utils/utils';
import { createAccordionItem } from '../Utils/generators';

export type Coord = Point | [ExtendedNumber, ExtendedNumber];

export default class Point extends Element {
  readonly x: Fraction;
  readonly y: Fraction;
  private _radius: number;

  private constructor(x: Fraction, y: Fraction) {
    super('point');
    this.x = x;
    this.y = y;
    this._radius = 0.05;
  }

  static fromCoords(coords: Coord): Point {
    if (coords instanceof Point) {
      return coords;
    } else {
      return new Point(processCoord(coords[0]), processCoord(coords[1]));
    }
  }

  info(name: string, parent: string, id: string) {
    const body = `Point: (${this.x.toFraction()}, ${this.y.toFraction()})`;
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    return (
      this.x.compare(rectangle.getLeft()) >= 0 &&
      this.x.compare(rectangle.getRight()) <= 0 &&
      this.y.compare(rectangle.getBottom()) >= 0 &&
      this.y.compare(rectangle.getTop()) <= 0
    );
  }

  draw(rectangle: RectangleView) {
    // const geometry = new THREE.BufferGeometry();
    // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [this.x.valueOf(), this.y.valueOf(), 0], 3 ) );
    //
    // const material = new THREE.PointsMaterial( { color: this._color } );
    //
    //  return new THREE.Points( geometry, material );
    const curve = new THREE.EllipseCurve(
      this.x.valueOf(),
      this.y.valueOf(), // ax, aY
      this._radius,
      this._radius, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0, // aRotation
    );
    const points = curve.getPoints(8);
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color: this._color });
    return new THREE.Mesh(geometry, material);
  }

  getDistanceToPoint(p: Point): number {
    return Math.sqrt(
      this.x.sub(p.x).pow(2).add(this.y.sub(p.y).pow(2)).valueOf(),
    );
  }

  equals(p: Point): boolean {
    return this.x.equals(p.x) && this.y.equals(p.y);
  }

  add(p: Point): Point {
    return Point.fromCoords([this.x.add(p.x), this.y.add(p.y)]);
  }

  sub(p: Point): Point {
    return Point.fromCoords([this.x.sub(p.x), this.y.sub(p.y)]);
  }

  multiplyScalar(s: Fraction): Point {
    return Point.fromCoords([this.x.mul(s), this.y.mul(s)]);
  }

  static triangleArea(p1: Point, p2: Point, p3: Point): Fraction {
    const D = p1.x
      .mul(p2.y)
      .add(p1.y.mul(p3.x))
      .add(p2.x.mul(p3.y))
      .sub(p2.y.mul(p3.x))
      .sub(p1.y.mul(p2.x))
      .sub(p3.y.mul(p1.x));
    return D.div(2);
  }
}
