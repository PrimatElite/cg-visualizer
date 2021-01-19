import * as THREE from 'three';
import Element from "./Element";
import Point from "./Point";
import { createAccordion, createAccordionItem } from "../Utils/generators";

export default class Vector extends Element {
    constructor(obj) {
        super('vector');
        this.begin = Point.fromCoords(obj.begin);
        this.end = Point.fromCoords(obj.end);
    }

    info(name, parent, id) {
        const newId = `${id}_data`;
        const begin = this.begin.info('begin', newId, `${id}_begin`);
        const end = this.end.info('end', newId, `${id}_end`);
        const body = createAccordion(newId, [begin, end]);
        return createAccordionItem(parent, name, body, id);
    }

    inRectangle(rectangle) {
        return this.begin.inRectangle(rectangle) || this.end.inRectangle();
    }

    draw() {
        const path = new THREE.Path([this.begin, this.end].map(p => new THREE.Vector2(p.x.valueOf(), p.y.valueOf())));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
        const lineMaterial = new THREE.LineBasicMaterial({color: this._color, linewidth: 2});
        const line = new THREE.Line(lineGeometry, lineMaterial);

        const headFactor = 0.2, widthFactor = 0.2;
        const dir = this.end.sub(this.begin);
        const dirOrth = Point.fromCoords([dir.y, dir.x.neg()]).multiplyScalar(headFactor * widthFactor / 2);
        const c = this.begin.add(dir.multiplyScalar(1 - headFactor));
        const p1 = c.add(dirOrth), p2 = c.sub(dirOrth);
        const shape = new THREE.Shape([this.end, p1, p2].map(v => new THREE.Vector2(v.x.valueOf(), v.y.valueOf())));
        const arrowGeometry = new THREE.ShapeGeometry(shape);
        const arrowMaterial = new THREE.MeshBasicMaterial({color: this._color});
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

        const group = new THREE.Group();
        group.add(line);
        group.add(arrow);
        return group;
    }
}
