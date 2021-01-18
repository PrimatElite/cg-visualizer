import * as THREE from 'three';
import { processCoord } from "../Utils/utils";
import { createAccordionItem } from "../Utils/generators";

export default class Point {
    constructor(obj) {
        this.radius = 0.05;
        this.x = processCoord(obj.coords[0]);
        this.y = processCoord(obj.coords[1]);
    }

    info(parent, id) {
        const body = `Point: (${this.x.toFraction()}, ${this.y.toFraction()})`;
        return createAccordionItem(parent, id, body, id);
    }

    draw(color=0x000) {
        // const geometry = new THREE.BufferGeometry();
        // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [this.x.valueOf(), this.y.valueOf(), 0], 3 ) );
        //
        // const material = new THREE.PointsMaterial( { color } );
        //
        //  return new THREE.Points( geometry, material );
        const curve = new THREE.EllipseCurve(
            this.x.valueOf(),  this.y.valueOf(),            // ax, aY
            this.radius, this.radius,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        const points = curve.getPoints( 8 );
        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color });
        return new THREE.Mesh( geometry, material );
    }

    getDistanceToPoint(p) {
        return Math.sqrt(this.x.sub(p.x).pow(2).add(this.y.sub(p.y).pow(2)).valueOf());
    }
}
