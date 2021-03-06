import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import Point from './Point';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';

export default class Polygon extends Element {
  readonly vertices: Array<Point>;
  readonly area: number;
  readonly perimeter: number;

  private constructor(vertices: Array<Point>) {
    super('polygon');
    this.vertices = vertices;
    this.area = this.getArea();
    this.perimeter = this.getPerimeter();
  }

  static fromVertices(vertices: Array<Point>): Polygon {
    return new Polygon(vertices);
  }

  getArea(): number {
    let s = new Fraction(0);
    const len = this.vertices.length;
    for (let i = 0; i < len - 1; i++) {
      s = s.add(
        this.vertices[i].x
          .mul(this.vertices[i + 1].y)
          .sub(this.vertices[i].y.mul(this.vertices[i + 1].x)),
      );
    }
    s = s.add(
      this.vertices[len - 1].x
        .mul(this.vertices[0].y)
        .sub(this.vertices[len - 1].y.mul(this.vertices[0].x)),
    );
    return s.div(2).valueOf();
  }

  getPerimeter(): number {
    let p = 0;
    const len = this.vertices.length;
    for (let i = 0; i < len - 1; i++) {
      p += this.vertices[i].getDistanceToPoint(this.vertices[i + 1]);
    }
    p += this.vertices[len - 1].getDistanceToPoint(this.vertices[0]);
    return p;
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const vertices = this.vertices.map((el, ind) =>
      el.info(`vertex_${ind}`, newId, `${id}_${ind}`),
    );
    const area = createAccordionItem(
      newId,
      'area',
      `Area: ${this.area}`,
      `${id}_area`,
    );
    const perimeter = createAccordionItem(
      newId,
      'perimeter',
      `Perimeter: ${this.perimeter}`,
      `${id}_perimeter`,
    );
    const body = createAccordion(newId, [area, perimeter, ...vertices]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    for (const vertex of this.vertices) {
      if (vertex.inRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }

  draw(rectangle: RectangleView) {
    const shape = new THREE.Shape(
      this.vertices.map((v) => new THREE.Vector2(v.x.valueOf(), v.y.valueOf())),
    );
    const path = new THREE.Path(
      [...this.vertices, this.vertices[0]].map(
        (v) => new THREE.Vector2(v.x.valueOf(), v.y.valueOf()),
      ),
    );
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(
      path.getPoints(),
    );
    const geometry = new THREE.ShapeGeometry(shape);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this._color,
      linewidth: 2,
    });
    const material = new THREE.MeshBasicMaterial({
      color: this._color,
      opacity: 0.3,
      transparent: true,
    });
    const poly = new THREE.Mesh(geometry, material);
    const contour = new THREE.Line(lineGeometry, lineMaterial);
    const group = new THREE.Group();
    group.add(poly);
    group.add(contour);
    return group;
  }
}
