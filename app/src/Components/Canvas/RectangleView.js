export default class RectangleView {
    constructor(x, y, w, h) {
        this.left = x - w / 2;
        this.right = x + w / 2;
        this.top = y + h / 2;
        this.bottom = y - h / 2;
    }

    updateRect(l, r, t, b) {
        this.left = l;
        this.right = r;
        this.top = t;
        this.bottom = b;
    }
}
