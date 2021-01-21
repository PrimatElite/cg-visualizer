import * as THREE from 'three';
import RectangleView from "./RectangleView";

export default class SceneManager {
    constructor(center, screenDimentions) {
        const { x, y } = center;
        const { width, height } = screenDimentions;

        this.scale = 1;
        this.aspectRatio = 4;

        this.scene = new THREE.Scene();
        this.viewRect = new RectangleView(x, y,
            width / this.scale * this.aspectRatio,
            height / this.scale * this.aspectRatio);
        this.objects = [];
    }

    _drawObjects() {
        this.objects.forEach(object => {
            // if (object.inRectangle(this.viewRect)) {
            this.scene.add(object.draw());
            // }
        });
    }

    _updateObjects(newObjects) {
        this.objects = newObjects;
        this._clearScene();
        this._drawObjects();
    }

    _clearScene() {
        while(this.scene.children.length > 0){
            this.scene.remove(this.scene.children[0]);
        }
    }

    updateScene(objects, newRectDim) {
        if (newRectDim !== undefined) {
            const { x, y, w, h } = newRectDim;
            this.viewRect.updateRect(x, y, w, h);
            this._drawObjects();
        }
        if (objects !== undefined && this.objects !== objects) {
            this._updateObjects(objects);
        }
    }

    _decreaseViewRectAspect(cameraRect) {
        const aspect = this.viewRect.getWidth() / cameraRect.getWidth();
        if (aspect > this.aspectRatio * 2) {
            this.viewRect.syncCenter(cameraRect);
            const doubleWStep = this.viewRect.getWidth() - this.aspectRatio * cameraRect.getWidth();
            const doubleHStep = this.viewRect.getHeight() - this.aspectRatio * cameraRect.getHeight();
            this.viewRect.scale(this.viewRect.getHeight() - doubleHStep,this.viewRect.getWidth() - doubleWStep);
        }
    }

    _normalizeViewRectAspect(cameraRect) {
        const aspect = this.viewRect.getWidth() / cameraRect.getWidth();
        if (aspect < this.aspectRatio / 2) {
            const doubleWStep = this.aspectRatio * cameraRect.getWidth() - this.viewRect.getWidth();
            const doubleHStep = this.aspectRatio * cameraRect.getHeight() - this.viewRect.getHeight();
            this.viewRect.scale(this.viewRect.getHeight() + doubleHStep,this.viewRect.getWidth() + doubleWStep);
            return true;
        }
        return false;
    }

    _handleMouseMove(cameraRect) {
        const wStep = this.viewRect.getWidth() / 2;
        const hStep = this.viewRect.getHeight() / 2;

        const direction = this.viewRect.innerIntersection(cameraRect)[0];

        if (direction) {
            const normalised = this._normalizeViewRectAspect(cameraRect);
            if (!normalised) {
                let step;
                if (['left', 'right'].includes(direction)) {
                    step = wStep;
                } else {
                    step = hStep;
                }
                this.viewRect.move(direction, step);
            }
        }
    }

    _handleWheel(cameraRect) {
        // zoom in
        const directions = this.viewRect.innerIntersection(cameraRect);
        if (directions.length) {
            this._normalizeViewRectAspect(cameraRect);
        }
        // zoom out
        this._decreaseViewRectAspect(cameraRect);
    }

    updateView(cameraRect, scale, eventType) {
        switch(eventType) {
            case 'wheel':
                this._handleWheel(cameraRect, scale);
                break;
            case 'mousemove':
                this._handleMouseMove(cameraRect);
                break;
            default:
                break;
        }
    }
}