import * as THREE from 'three';
import { getMyColor } from "../Utils/utils";
import {createAccordion, createAccordionItem} from "../Utils/generators";


export default class Paints {
    constructor(obj) {
        this.objects = obj.input;
        this.values = obj.output;
        this.colors = {};
        for (const element of new Set(obj.output)) {
            this.colors[element] = getMyColor(element);
        }
    }

    info(parent, id) {
        const newId = `${id}_data`;
        const objectsId = `${newId}_objects`;
        const valuesId = `${newId}_values`;
        const objects = createAccordion(`${objectsId}_data`, this.objects.map((el, ind) => el.info(`${objectsId}_data`, `${objectsId}_${ind}`)));
        const values = createAccordion(`${valuesId}_data`, this.values.map((el, ind) => createAccordionItem(`${valuesId}_data`, ind, el.toString(), `${valuesId}_${ind}`)));
        const body = createAccordion(newId, [createAccordionItem(newId, 'objects', objects, objectsId),
                                                     createAccordionItem(newId, 'values', values, valuesId)]);
        return createAccordionItem(parent, id, body, id);
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