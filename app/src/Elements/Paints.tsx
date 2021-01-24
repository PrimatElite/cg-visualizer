import * as THREE from 'three';
import Element from './Element';
import MyBoolean from './Boolean';
import MyNumber from './Number';
import RectangleView from '../Components/Canvas/RectangleView';
import { getMyColor } from '../Utils/utils';
import { createAccordion, createAccordionItem } from '../Utils/generators';

type ColorMap = {
  [k: number]: number;
};

export default class Paints extends Element {
  readonly objects: Array<Element>;
  readonly values: Array<boolean> | Array<number>;
  private _uniqueValues: Array<number>;
  private _shift: number;

  private constructor(
    objects: Array<Element>,
    values: Array<boolean> | Array<number>,
  ) {
    super('paints');
    this.objects = objects;
    this.values = values;

    let tmpSet;
    if (typeof this.values[0] === 'number') {
      tmpSet = new Set(this.values as Array<number>);
      this._uniqueValues = Array.from(tmpSet);
      const min = Math.min(...this._uniqueValues);
      this._shift = min >= 0 ? 0 : Math.abs(min);
    } else {
      tmpSet = new Set(this.values as Array<boolean>);
      const tmpArray = [];
      for (const value of tmpSet.values()) {
        tmpArray.push(value);
      }
      this._uniqueValues = tmpArray.map((v) => +v);
      this._shift = 0;
    }
    this._updateColors();
  }

  static fromObjectsValues(
    objects: Array<Element>,
    values: Array<MyBoolean> | Array<MyNumber>,
  ): Paints {
    if (objects.length !== values.length) {
      throw new Error('Incorrect lengths');
    }
    if (values[0] instanceof MyBoolean) {
      return new Paints(
        objects,
        (values as Array<MyBoolean>).map((v) => v.value),
      );
    }
    return new Paints(
      objects,
      (values as Array<MyNumber>).map((v) => v.value),
    );
  }

  private _updateColors() {
    const colors: ColorMap = {};
    for (const element of this._uniqueValues) {
      colors[element] = getMyColor(element + this._shift, this._color);
    }
    this.objects.forEach((o, ind) => {
      o.color = colors[+this.values[ind]];
    });
  }

  set color(color: number) {
    this._color = color;
    this._updateColors();
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const objectsId = `${newId}_objects`;
    const valuesId = `${newId}_values`;
    const objects = createAccordion(
      `${objectsId}_data`,
      this.objects.map((el, ind) =>
        el.info(`object_${ind}`, `${objectsId}_data`, `${objectsId}_${ind}`),
      ),
    );
    let values;
    if (typeof this.values[0] === 'boolean') {
      values = createAccordion(
        `${valuesId}_data`,
        (this.values as Array<boolean>).map((el, ind) =>
          createAccordionItem(
            `${valuesId}_data`,
            `value_${ind}`,
            el.toString(),
            `${valuesId}_${ind}`,
          ),
        ),
      );
    } else {
      values = createAccordion(
        `${valuesId}_data`,
        (this.values as Array<number>).map((el, ind) =>
          createAccordionItem(
            `${valuesId}_data`,
            `value_${ind}`,
            el.toString(),
            `${valuesId}_${ind}`,
          ),
        ),
      );
    }
    const body = createAccordion(newId, [
      createAccordionItem(newId, 'objects', objects, objectsId),
      createAccordionItem(newId, 'values', values, valuesId),
    ]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    for (const object of this.objects) {
      if (object.inRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }

  draw(rectangle: RectangleView) {
    const group = new THREE.Group();
    this.objects.forEach((o, ind) => {
      console.log(ind, o.color);
      group.add(o.draw(rectangle));
    });
    return group;
  }
}
