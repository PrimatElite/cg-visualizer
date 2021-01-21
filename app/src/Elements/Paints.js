import * as THREE from 'three';
import Element from "./Element";
import { getMyColor } from "../Utils/utils";
import { createAccordion, createAccordionItem } from "../Utils/generators";

export default class Paints extends Element {
    constructor(obj) {
        super('paints');
        this.objects = obj.input;
        this.values = obj.output.map(el => el.value);

        this.uniqueValues = new Set(this.values);
        this.shift = 0;
        if ((typeof this.uniqueValues.values().next().value) === 'number') {
            const min = Math.min(...Array.from(this.uniqueValues));
            this.shift = 0 ? min >= 0 : Math.abs(min);
        }
        this._updateColors();
    }

    info(name, parent, id) {
        const newId = `${id}_data`;
        const objectsId = `${newId}_objects`;
        const valuesId = `${newId}_values`;
        const objects = createAccordion(`${objectsId}_data`, this.objects.map((el, ind) => el.info(`object_${ind}`, `${objectsId}_data`, `${objectsId}_${ind}`)));
        const values = createAccordion(`${valuesId}_data`, this.values.map((el, ind) => createAccordionItem(`${valuesId}_data`, `value_${ind}`, el.toString(), `${valuesId}_${ind}`)));
        const body = createAccordion(newId, [createAccordionItem(newId, 'objects', objects, objectsId),
                                                     createAccordionItem(newId, 'values', values, valuesId)]);
        return createAccordionItem(parent, name, body, id);
    }

    inRectangle(rectangle) {
        for (const object of this.objects) {
            if (object.inRectangle(rectangle)) {
                return true;
            }
        }
        return false;
    }

    _updateColors() {
        const colors = {};
        for (const element of this.uniqueValues) {
            colors[element] = getMyColor(element + this.shift, this._color);
        }
        this.objects.forEach((o, ind) => {
            o.setColor(colors[this.values[ind]]);
        });
    }

    setColor(color) {
        Element.prototype.setColor.apply(this, color);
        this._updateColors();
    }

    draw(rectangle) {
        const group = new THREE.Group();
        this.objects.forEach((o, ind) => {
            console.log(ind, o.getColor());
            group.add(o.draw());
        });
        return group;
    }
}
