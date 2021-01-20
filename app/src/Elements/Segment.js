import * as THREE from 'three';
import Element from "./Element";
import Point from "./Point";
import { createAccordion, createAccordionItem } from "../Utils/generators";
import { triangleArea } from "../Utils/utils";

export default class Segment extends Element {
    constructor(obj) {
        super('segment');
        if (obj.type === 'segment_side') {
            this.p1 = obj.side[0];
            this.p2 = obj.side[1];
        } else {
            this.p1 = Point.fromCoords(obj.coords1);
            this.p2 = Point.fromCoords(obj.coords2);
        }
        this.length = this.p1.getDistanceToPoint(this.p2);
    }

    info(name, parent, id) {
        const newId = `${id}_data`;
        const point1 = this.p1.info('point1', newId, `${id}_point1`);
        const point2 = this.p2.info('point2', newId, `${id}_point2`);
        const length = createAccordionItem(newId, 'length', `Length: ${this.length}`, `${id}_length`);
        const body = createAccordion(newId, [length, point1, point2]);
        return createAccordionItem(parent, name, body, id);
    }

    inRectangle(rectangle) {
        return true // TODO
    }

    draw() {
        const path = new THREE.Path([this.p1, this.p2].map(p => new THREE.Vector2(p.x.valueOf(), p.y.valueOf())));
        const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
        const material = new THREE.LineBasicMaterial({ color: this._color, linewidth: 2});
        return new THREE.Line(geometry, material);
    }

    intersectWithPoint(point) {
        if (this.p1.x.equals(this.p2.x) && this.p1.y.equals(this.p2.y)) {
            if (point.x.equals(this.p1.x) && point.y.equals(this.p1.y)) {
                return point;
            }
        } else if (triangleArea(this.p1, this.p2, point).equals(0)) {
            let t = 2;
            if (this.p1.x.equals(this.p2.x)) {
                t = point.y.sub(this.p1.y).div(this.p2.y.sub(this.p1.y));
            } else {
                t = point.x.sub(this.p1.x).div(this.p2.x.sub(this.p1.x));
            }
            if (t.compare(0) >= 0 && t.compare(1) <= 0) {
                return point;
            }
        }
        throw Error("Can't find intersection of two segments"); // TODO make beautiful error handler
    }
}
