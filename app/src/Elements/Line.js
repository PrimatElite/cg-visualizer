import * as THREE from 'three';
import Element from "./Element";
import Point from "./Point";
import { createAccordion, createAccordionItem } from "../Utils/generators";
import { processCoord, triangleArea, getLeftPartLineEquation } from "../Utils/utils";

export default class Line extends Element {
    constructor(obj) {
        super('line');
        if (obj.type === 'line_equation') {
            this.coefficients = obj.coefficients.map(el => processCoord(el));
            this.direction = obj.direction || 'forward';
            this.p1 = this.p2 = undefined;
        } else {
            if (obj.type === 'line_side') {
                this.p1 = obj.side[0];
                this.p2 = obj.side[1];
            } else {
                this.p1 = Point.fromCoords(obj.coords1);
                this.p2 = Point.fromCoords(obj.coords2);
            }
            this.coefficients = [this.p2.y.sub(this.p1.y), this.p1.x.sub(this.p2.x),
                this.p2.x.mul(this.p1.y).sub(this.p1.x.mul(this.p2.y))];
            this.direction = 'forward';
        }
    }

    info(name, parent, id) {
        const newId = `${id}_data`;

        const equationStr = `${getLeftPartLineEquation(this.coefficients)}=0`;
        const equation = createAccordionItem(newId, 'equation', `Equation: ${equationStr}`, `${id}_equation`);

        let directionStr;
        if (this.direction === 'forward') {
            directionStr = `(${this.coefficients[1].neg().toFraction()}, ${this.coefficients[0].toFraction()})`;
        } else {
            directionStr = `(${this.coefficients[1].toFraction()}, ${this.coefficients[0].neg().toFraction()})`;
        }
        const direction = createAccordionItem(newId, 'direction', `Direction: ${directionStr}`, `${id}_direction`);

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

    inRectangle(rectangle) {
        if (this.coefficients[0].equals(0) && this.coefficients[1].equals(0)) {
            return false;
        }
        let point1 = this.p1, point2 = this.p2;
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

        const left = Math.floor(rectangle.getLeft()), right = Math.ceil(rectangle.getRight());
        const top = Math.ceil(rectangle.getTop()), bottom = Math.floor(rectangle.getBottom());
        const corners = [Point.fromCoords([left, top]), Point.fromCoords([left, bottom]),
            Point.fromCoords([right, bottom]), Point.fromCoords([right, top])];
        const vertices = [...corners, corners[0]];
        let areaSign1, areaSign2;
        for (let i = 0; i < 4; i++) {
            areaSign1 = triangleArea(point1, point2, vertices[i]).compare(0);
            areaSign2 = triangleArea(point1, point2, vertices[i + 1]).compare(0);
            if ((areaSign1 !== areaSign2 && areaSign1 !== 0 && areaSign2 !== 0) ||
                (areaSign1 === 0 && areaSign2 === 0)) {
                return true;
            }
        }
        return false;
    }

    draw(rectangle) {
        let point1, point2;
        if (this.coefficients[0].equals(0) && this.coefficients[1].equals(0)) {
            if (this.p1 && this.p2) {
                point1 = this.p1;
                point2 = this.p2;
            } else {
                return undefined;
            }
        } else {
            const left = Math.floor(rectangle.getLeft()), right = Math.ceil(rectangle.getRight());
            const top = Math.ceil(rectangle.getTop()), bottom = Math.floor(rectangle.getBottom());

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

        const path = new THREE.Path([point1, point2].map(p => new THREE.Vector2(p.x.valueOf(), p.y.valueOf())));
        const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
        const material = new THREE.LineBasicMaterial({ color: this._color, linewidth: 2 });
        return new THREE.Line(geometry, material);
    }
}
