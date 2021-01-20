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

    getCenter() {
        const x = (this.right - this.left) / 2;
        const y = (this.top - this.bottom) / 2;
        return { x, y };
    }

    // put this center to rect center
    syncCenter(rect) {
        const newCenter = rect.getCenter();
        const halfWidth = this.getWidth() / 2;
        const halfHeight = this.getHeight() / 2;

        this.left = newCenter.x - halfWidth;
        this.right = newCenter.x + halfWidth;
        this.bottom = newCenter.y - halfHeight;
        this.top = newCenter.y + halfHeight;
    }

    getWidth() {
        return this.right - this.left;
    }

    getHeight() {
        return this.top - this.bottom;
    }

    move(direction, shift) {
        switch (direction) {
            case 'left':
                this.left -= shift;
                this.right -= shift;
                break;
            case 'right':
                this.left += shift;
                this.right += shift;
                break;
            case 'top':
                this.top += shift;
                this.bottom += shift;
                break;
            case 'bottom':
                this.top -= shift;
                this.bottom -= shift;
                break;
            default:
                throw Error('Unsupported direction');
        }
    }

    scale(hShift, wShift) {
        this.top += hShift;
        this.bottom -= hShift;
        this.left -= wShift;
        this.right += wShift;
    }

    // check out, if rect's bounds is too near to this's bounds
    innerIntersection(rect) {
        const wShift = (this.right - this.left) * 0.1;
        const hShift = (this.top - this.bottom) * 0.1;
        const directions = [];

        if (rect.right >= this.right - wShift) {
            directions.push('right');
        }
        if (rect.left <= this.left + wShift) {
            directions.push('left');
        }
        if (rect.bottom <= this.bottom + hShift) {
            directions.push('bottom');
        }
        if (rect.top >= this.top - hShift) {
            directions.push('top');
        }

        return directions;
    }
}
