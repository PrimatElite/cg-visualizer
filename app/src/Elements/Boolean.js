import Element from "./Element";
import { createAccordionItem } from "../Utils/generators";

export default class Boolean extends Element {
    constructor(obj) {
        super('boolean');
        this.value = obj;
    }

    info(name, parent, id) {
        const body = `Value: ${this.value}`;
        return createAccordionItem(parent, name, body, id);
    }

    inRectangle(rectangle) {
        return false;
    }

    draw() {
        return undefined;
    }
}
