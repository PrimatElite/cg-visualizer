import * as THREE from 'three';
import { processCoord } from "../Utils/utils";


export default class Point {
    constructor(obj) {
        this.radius = 0.05;
        this.x = processCoord(obj.coords[0]);
        this.y = processCoord(obj.coords[1]);
    }

    draw(color=0x000) {
        const curve = new THREE.EllipseCurve(
            this.x.valueOf(),  this.y.valueOf(),            // ax, aY
            this.radius, this.radius,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        const points = curve.getPoints( 50 )
        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color });
        return new THREE.Mesh( geometry, material );
    }
}