import { getByRef } from "./schema";


function drawVisualizations(scene, data) {
    console.log(data);
    data.visualizations.forEach(item => {
        draw(scene, data, getByRef(data, item.$ref));
    });
}

const draw = (scene, data, item) => {
    if (item instanceof Array) {
        item.forEach(el => draw(scene, data, el));
    } else {
        scene.add(item.draw());
    }
}

export default drawVisualizations;
