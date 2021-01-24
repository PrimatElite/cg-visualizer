import { getByRef } from './schema';

function drawVisualizations(data) {
  const sceneObjects = [];
  data.visualizations.forEach((item) => {
    draw(sceneObjects, data, getByRef(data, item.$ref));
  });
  return sceneObjects;
}

const draw = (objects, data, item) => {
  if (item instanceof Array) {
    item.forEach((el) => draw(objects, data, el));
  } else {
    objects.push(item);
  }
};

export default drawVisualizations;
