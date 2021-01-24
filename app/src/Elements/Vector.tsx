import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import Point, { Coord } from './Point';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';

export default class Vector extends Element {
  readonly begin: Point;
  readonly end: Point;

  private constructor(begin: Point, end: Point) {
    super('vector');
    this.begin = begin;
    this.end = end;
  }

  static fromCoords(begin: Coord, end: Coord): Vector {
    return new Vector(Point.fromCoords(begin), Point.fromCoords(end));
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const begin = this.begin.info('begin', newId, `${id}_begin`);
    const end = this.end.info('end', newId, `${id}_end`);
    const body = createAccordion(newId, [begin, end]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    return this.begin.inRectangle(rectangle) || this.end.inRectangle(rectangle);
  }

  draw(rectangle: RectangleView) {
    const path = new THREE.Path(
      [this.begin, this.end].map(
        (p) => new THREE.Vector2(p.x.valueOf(), p.y.valueOf()),
      ),
    );
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
      path.getPoints(),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this._color,
      linewidth: 2,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    const headFactor = 0.2,
      widthFactor = 0.2;
    const dir = this.end.sub(this.begin);
    const dirOrth = Point.fromCoords([dir.y, dir.x.neg()]).multiplyScalar(
      new Fraction((headFactor * widthFactor) / 2),
    );
    const c = this.begin.add(dir.multiplyScalar(new Fraction(1 - headFactor)));
    const p1 = c.add(dirOrth),
      p2 = c.sub(dirOrth);
    const shape = new THREE.Shape(
      [this.end, p1, p2].map(
        (v) => new THREE.Vector2(v.x.valueOf(), v.y.valueOf()),
      ),
    );
    const arrowGeometry = new THREE.ShapeGeometry(shape);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: this._color });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

    const group = new THREE.Group();
    group.add(line);
    group.add(arrow);
    return group;
  }
}
