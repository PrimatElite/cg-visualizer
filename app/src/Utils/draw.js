import Polygon from '../Elements/Polygon';
import { getByRef } from "./schema";

function drawItem(scene, data, item) {
    switch (item.type) {
        case 'polygon':
            const points = getByRef(data, item.src.$ref);
            const polygon = new Polygon(points);
            scene.add(polygon.draw());
            break;
        case 'paints':
            break;
        default:
            console.log('Unsupported visualization type');
    }
}

function drawVisualizations(scene, data) {
    data.visualizations.forEach(item => {
        draw(scene, data, item);
    });
}

const draw = (scene, data, item) => {
    if (!item.type) {
        item = getByRef(data, item.$ref);
    }

    if ((typeof item) === 'object') {
        drawItem(scene, data, item);
    } else {
        item.forEach(el => draw(scene, data, el));
    }
}

export default drawVisualizations;
