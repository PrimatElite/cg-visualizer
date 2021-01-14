import * as THREE from 'three';
import { getMyColor } from "../Utils/utils";


export default class Paints {
    constructor(obj) {
        this.objects = obj.input;
        this.values = obj.output;
        this.colors = {};
        for (const element of new Set(obj.output)) {
            this.colors[element] = getMyColor(element);
        }
    }

    draw() {
        const group = new THREE.Group();
        this.objects.forEach((o, ind) => {
            console.log(ind, this.colors[this.values[ind]]);
            group.add(o.draw(this.colors[this.values[ind]]));
        });
        return group;
    }
}