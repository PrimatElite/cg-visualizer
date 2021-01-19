import colors from "../Config/colors";

export default class Element {
    constructor(type) {
        this.type = type;
        this._color = colors[type] || 0x000;
    }

    info(name, parent, id) {
        throw new Error("Method 'info(name, parent, id)' must be implemented.");
    }

    isInRectangle(rectangle) {
        throw new Error("Method 'isInRectangle(rectangle)' must be implemented.");
    }

    getColor() {
        return this._color;
    }

    setColor(color) {
        this._color = color;
    }

    draw() {
        throw new Error("Method 'draw()' must be implemented.");
    }
}
