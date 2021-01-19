import * as THREE from 'three';
import Point from "./Point";
import { createAccordion, createAccordionItem } from "../Utils/generators";

export default class Segment {
    constructor(obj) {
        if (obj.type === 'segment_side') {
            this.p1 = obj.side[0];
            this.p2 = obj.side[1];
        } else {
            this.p1 = Point.fromCoords(obj.coords1);
            this.p2 = Point.fromCoords(obj.coords2);
        }
        this.length = this.p1.getDistanceToPoint(this.p2);
        this.type = 'segment';
    }

    info(parent, id) {
        const newId = `${id}_data`;
        const point1 = this.p1.info(newId, `${id}_point1`);
        const point2 = this.p2.info(newId, `${id}_point2`);
        const length = createAccordionItem(newId, 'length', `Length: ${this.length}`, `${id}_length`);
        const body = createAccordion(newId, [length, point1, point2]);
        return createAccordionItem(parent, id, body, id);
    }

    draw(color=0xFAF) {
        const path = new THREE.Path([this.p1, this.p2].map(p => new THREE.Vector2(p.x.valueOf(), p.y.valueOf())));
        const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2});
        return new THREE.Line(geometry, material);
    }
}
