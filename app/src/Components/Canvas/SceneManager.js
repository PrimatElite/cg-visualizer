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
            this.scene.add(object);
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
            const { left, right, top, bottom } = newRectDim;
            this.viewRect.updateRect(left, right, top, bottom);
            this._drawObjects();
        }
        if (objects !== undefined && this.objects !== objects) {
            this._updateObjects(objects);
        }
    }

    updateView(cameraRect, scale, ) {
        // console.log(`cameraRect:`, cameraRect);
        // console.log(`viewRect:`, this.viewRect);

    }
}