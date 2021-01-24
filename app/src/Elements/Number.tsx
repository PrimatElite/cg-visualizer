import Element from './Element';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordionItem } from '../Utils/generators';
import { error } from '../Utils/utils';

export default class MyNumber extends Element {
  readonly value: number;

  private constructor(value: number) {
    super('number');
    this.value = value;
  }

  static fromNumber(value: MyNumber | number): MyNumber {
    if (value instanceof MyNumber) {
      return value;
    } else {
      return new MyNumber(value);
    }
  }

  info(name: string, parent: string, id: string) {
    const body = `Value: ${this.value}`;
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    return false;
  }

  draw(rectangle: RectangleView) {
    return error("Number can't be drawn");
  }
}
