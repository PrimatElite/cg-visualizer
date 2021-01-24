import * as THREE from 'three';
import Element from './Element';
import Point from './Point';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';

export default class PolyLine extends Element {
  readonly vertices: Array<Point>;

  private constructor(vertices: Array<Point>) {
    super('polyline');
    this.vertices = vertices;
  }

  static fromPoints(points: Array<Point>): PolyLine {
    return new PolyLine(points);
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const vertices = this.vertices.map((el, ind) =>
      el.info(`vertex_${ind}`, newId, `${id}_${ind}`),
    );
    const body = createAccordion(newId, vertices);
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
    const path = new THREE.Path(
      [...this.vertices, this.vertices[0]].map(
        (v) => new THREE.Vector2(v.x.valueOf(), v.y.valueOf()),
      ),
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    const material = new THREE.LineBasicMaterial({
      color: this._color,
      linewidth: 2,
    });
    return new THREE.Line(geometry, material);
  }
}
