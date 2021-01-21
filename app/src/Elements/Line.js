import * as THREE from 'three';
import Element from "./Element";
import Point from "./Point";
import { createAccordion, createAccordionItem } from "../Utils/generators";
import { processCoord } from "../Utils/utils";

export default class Line extends Element {
    constructor(obj) {
        super('line');
        if (obj.type === 'line_equation') {
            this.coefficients = obj.coefficients.map(el => processCoord(el));
            this.direction = obj.direction || 'forward';
            this.p1 = this.p2 = undefined;
        } else {
            if (obj.type === 'line_side') {
                this.p1 = obj.side[0];
                this.p2 = obj.side[1];
            } else {
                this.p1 = Point.fromCoords(obj.coords1);
                this.p2 = Point.fromCoords(obj.coords2);
            }
            this.coefficients = [this.p2.y.sub(this.p1.y), this.p1.x.sub(this.p2.x),
                this.p2.x.mul(this.p1.y).sub(this.p1.x.mul(this.p2.y))];
            this.direction = 'forward';
        }
    }

    info(name, parent, id) {
        const newId = `${id}_data`;

        let equationStr = '';
        if (!this.coefficients[0].equals(0)) {
            equationStr += `${this.coefficients[0].toFraction()}x`;
        }
        if (this.coefficients[1].compare(0) < 0) {
            equationStr += `${this.coefficients[1].toFraction()}y`;
        } else if (this.coefficients[1].compare(0) > 0) {
            equationStr += `+${this.coefficients[1].toFraction()}y`;
        }
        if (this.coefficients[2].compare(0) < 0) {
            equationStr += `${this.coefficients[2].toFraction()}`;
        } else if (this.coefficients[2].compare(0) > 0) {
            equationStr += `+${this.coefficients[2].toFraction()}`;
        }
        equationStr += '=0';
        const equation = createAccordionItem(newId, 'equation', `Equation: ${equationStr}`, `${id}_equation`);

        let directionStr;
        if (this.direction === 'forward') {
            directionStr = `(${this.coefficients[1].neg().toFraction()}, ${this.coefficients[0].toFraction()})`;
        } else {
            directionStr = `(${this.coefficients[1].toFraction()}, ${this.coefficients[0].neg().toFraction()})`;
        }
        const direction = createAccordionItem(newId, 'direction', `Direction: ${directionStr}`, `${id}_direction`);

        let body;
        if (this.p1 && this.p2) {
            const point1 = this.p1.info('point1', newId, `${id}_point1`);
            const point2 = this.p2.info('point2', newId, `${id}_point2`);
            body = createAccordion(newId, [equation, direction, point1, point2]);
        } else {
            body = createAccordion(newId, [equation, direction]);
        }
        return createAccordionItem(parent, name, body, id);
    }

    inRectangle(rectangle) {
        return true;
    }

    draw(rectangle) {
        return undefined;
    }
}
