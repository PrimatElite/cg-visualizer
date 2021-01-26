import * as THREE from 'three';
import Fraction from 'fraction.js';
import Element from './Element';
import Point, { Coord } from './Point';
import Segment from './Segment';
import Line, { LineDirection } from './Line';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';
import { ExtendedNumber, getLeftPartLineEquation, error } from '../Utils/utils';

export default class HalfPlane extends Element {
  readonly line: Line;

  private constructor(line: Line) {
    super('half-plane');
    this.line = line;
  }

  static fromEquation(
    coefficients: [ExtendedNumber, ExtendedNumber, ExtendedNumber],
    direction: LineDirection = 'forward',
  ): HalfPlane {
    return new HalfPlane(Line.fromEquation(coefficients, direction));
  }

  static fromSide(side: [Point, Point]): HalfPlane {
    return new HalfPlane(Line.fromSide(side));
  }

  static fromCoords(coords1: Coord, coords2: Coord): HalfPlane {
    return HalfPlane.fromSide([
      Point.fromCoords(coords1),
      Point.fromCoords(coords2),
    ]);
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;

    let equationStr = `${getLeftPartLineEquation(this.line.coefficients)}`;
    equationStr += this.line.direction === 'forward' ? '<=0' : '>=0';
    const equation = createAccordionItem(
      newId,
      'equation',
      this.line.isUndefined
        ? 'Half-plane is undefined'
        : `Equation: ${equationStr}`,
      `${id}_equation`,
    );

    const dir = this.line.getDirectionPoint();
    const direction = createAccordionItem(
      newId,
      'direction',
      `Direction: (${dir.x.toFraction()}, ${dir.y.toFraction()})`,
      `${id}_direction`,
    );

    let body;
    if (this.line.p1 && this.line.p2) {
      const point1 = this.line.p1.info('point1', newId, `${id}_point1`);
      const point2 = this.line.p2.info('point2', newId, `${id}_point2`);
      body = createAccordion(newId, [equation, direction, point1, point2]);
    } else {
      body = createAccordion(newId, [equation, direction]);
    }
    return createAccordionItem(parent, name, body, id);
  }

  _getValueComparator() {
    if (this.line.direction === 'forward') {
      return (value: Fraction) => value.compare(0) <= 0;
    } else {
      return (value: Fraction) => value.compare(0) >= 0;
    }
  }

  _getPointComparator() {
    const valueComparator = this._getValueComparator();
    return (point: Point) => valueComparator(this.line.getLineValue(point));
  }

  inRectangle(rectangle: RectangleView) {
    if (this.line.isUndefined) {
      return false;
    }

    const comparator = this._getPointComparator();
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
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (comparator(corners[i])) {
        count += 1;
      }
    }
    return count >= 1;
  }

  draw(rectangle: RectangleView) {
    if (this.line.isUndefined) {
      return error("Half-plane can't be drawn");
    }

    // search corners in half-plane
    const comparator = this._getValueComparator();
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
    const values = corners.map((corner) => this.line.getLineValue(corner));
    let indices = [];
    let fourthPoint = corners[0];
    for (let i = 0; i < 4; i++) {
      if (comparator(values[i])) {
        indices.push(i);
      } else {
        fourthPoint = corners[i];
      }
    }

    let path = undefined,
      shape = undefined,
      point = undefined;
    const vertices = [];

    if (indices.length === 4) {
      // all corners of rectangle in half-plane
      shape = new THREE.Shape(
        corners.map((c) => new THREE.Vector2(c.x.valueOf(), c.y.valueOf())),
      );
    } else if (indices.length > 0) {
      // at least one corner in half-plane but not all => line intersects rectangle
      // so, just find points of this intersection
      let prevPoint = fourthPoint,
        nextPoint = fourthPoint;
      if (indices.length === 3) {
        if (indices[1] - indices[0] > 1) {
          indices = [indices[1], indices[2], indices[0]];
        } else if (indices[2] - indices[1] > 1) {
          indices = [indices[2], indices[0], indices[1]];
        }
      } else {
        if (indices.length === 2 && indices[1] - indices[0] > 2) {
          indices = [indices[1], indices[0]];
        }
        prevPoint = corners[(indices[0] + 3) % 4];
        nextPoint = corners[(indices[indices.length - 1] + 1) % 4];
      }

      if (!values[indices[0]].equals(0)) {
        point = this.line.intersectWithSegment(
          Segment.fromCoords(prevPoint, corners[indices[0]]),
        );
        if (point) {
          vertices.push(point);
        }
      }
      indices.forEach((ind) => vertices.push(corners[ind]));
      if (!values[indices[indices.length - 1]].equals(0)) {
        point = this.line.intersectWithSegment(
          Segment.fromCoords(corners[indices[indices.length - 1]], nextPoint),
        );
        if (point) {
          vertices.push(point);
        }
      }

      if (vertices.length > 1) {
        path = new THREE.Path(
          [vertices[0], vertices[vertices.length - 1]].map(
            (p) => new THREE.Vector2(p.x.valueOf(), p.y.valueOf()),
          ),
        );
        if (vertices.length > 2) {
          shape = new THREE.Shape(
            vertices.map(
              (v) => new THREE.Vector2(v.x.valueOf(), v.y.valueOf()),
            ),
          );
        }
      }
    }

    const group = new THREE.Group();
    if (shape) {
      const planeGeometry = new THREE.ShapeGeometry(shape);
      const shapeMaterial = new THREE.MeshBasicMaterial({
        color: this._color,
        opacity: 0.3,
        transparent: true,
      });
      group.add(new THREE.Mesh(planeGeometry, shapeMaterial));
    }
    if (path) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        path.getPoints(),
      );
      const lineMaterial = new THREE.LineBasicMaterial({
        color: this._color,
        linewidth: 2,
      });
      group.add(new THREE.Line(lineGeometry, lineMaterial));
    }
    return group;
  }
}
