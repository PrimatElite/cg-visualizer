import Polygon from '../Elements/Polygon';
import { getByRef } from "./schema";

const draw = (scene, data) => {
    data.visualizations.forEach(item => {
        switch (item.type) {
            case 'polygon':
                const points = getByRef(data, item.src.$ref);
                const polygon = new Polygon(points);
                scene.add(polygon.draw());
                break;
            default:
                console.log('Unsupported visualization type');
        }
    });
}

export default draw;
