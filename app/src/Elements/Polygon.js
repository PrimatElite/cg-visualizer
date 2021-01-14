import * as THREE from 'three';

export default class Polygon {
    constructor(obj) {
        this.vertices = obj.src;
    }
    draw(color=0xFAF) {
        const shape = new THREE.Shape(this.vertices.map(v => new THREE.Vector2(v.x.valueOf(), v.y.valueOf())));
        const path = new THREE.Path([...this.vertices, this.vertices[0]].map(v => new THREE.Vector2(v.x.valueOf(), v.y.valueOf())));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints( path.getPoints() )
        const geometry = new THREE.ShapeGeometry(shape);
        const lineMaterial = new THREE.LineBasicMaterial({ color, linewidth: 2});
        const material = new THREE.MeshBasicMaterial(
            {
                color,
                opacity: 0.3,
                transparent: true,
            });
        const poly = new THREE.Mesh( geometry, material );
        const contour = new THREE.Line(lineGeometry, lineMaterial);
        const group = new THREE.Group();
        group.add(poly);
        group.add(contour);
        return group;
    }

}

