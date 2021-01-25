import * as THREE from 'three';
import colors from '../Config/colors';
import RectangleView from '../Components/Canvas/RectangleView';

export default abstract class Element {
  readonly type: string;
  protected _color: number;

  protected constructor(type: string) {
    this.type = type;
    this._color = colors[type] || 0x000;
  }

  get color(): number {
    return this._color;
  }

  set color(color: number) {
    this._color = color;
  }

  abstract info(name: string, parent: string, id: string): any;

  abstract inRectangle(rectangle: RectangleView): boolean;

  abstract draw(rectangle: RectangleView): THREE.Object3D | never;
}
