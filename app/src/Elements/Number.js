import Element from './Element';
import { createAccordionItem } from '../Utils/generators';

export default class Number extends Element {
  constructor(obj) {
    super('number');
    this.value = obj;
  }

  info(name, parent, id) {
    const body = `Value: ${this.value}`;
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle) {
    return false;
  }

  draw(rectangle) {
    return undefined;
  }
}
