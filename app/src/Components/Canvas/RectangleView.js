export default class RectangleView {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    updateRect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    getCenter() {
        return { x: this.x, y: this.y };
    }

    getLeft() {
        return this.x - this.w / 2;
    }

    getRight() {
        return this.x + this.w / 2;
    }

    getBottom() {
        return this.y - this.h / 2;
    }

    getTop() {
        return this.y + this.h / 2;
    }

    // put this center to rect center
    syncCenter(rect) {
        this.x = rect.x;
        this.y = rect.y;
    }

    getWidth() {
        return this.w;
    }

    getHeight() {
        return this.h;
    }

    move(direction, shift) {
        switch (direction) {
            case 'left':
                this.x -= shift;
                break;
            case 'right':
                this.x += shift;
                break;
            case 'top':
                this.y += shift;
                break;
            case 'bottom':
                this.y -= shift;
                break;
            default:
                throw Error('Unsupported direction');
        }
    }

    scale(newH, newW) {
        this.w = newW;
        this.h = newH;
    }

    // check out, if rect's bounds is too near to this's bounds
    innerIntersection(rect) {
        const wShift = this.w * 0.1;
        const hShift = this.h * 0.1;
        const directions = [];

        if (rect.getRight() >= this.getRight() - wShift) {
            directions.push('right');
        }
        if (rect.getLeft() <= this.getLeft() + wShift) {
            directions.push('left');
        }
        if (rect.getBottom() <= this.getBottom() + hShift) {
            directions.push('bottom');
        }
        if (rect.getTop() >= this.getTop() - hShift) {
            directions.push('top');
        }

        return directions;
    }
}
