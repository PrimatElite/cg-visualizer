import Element from './Element';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordionItem } from '../Utils/generators';
import { error } from '../Utils/utils';

export default class MyBoolean extends Element {
  readonly value: boolean;

  private constructor(value: boolean) {
    super('boolean');
    this.value = value;
  }

  static fromBoolean(value: MyBoolean | boolean): MyBoolean {
    if (value instanceof MyBoolean) {
      return value;
    } else {
      return new MyBoolean(value);
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
    return error("Boolean can't be drawn");
  }
}
