function stepInJson(obj, key) {
    // if (key.length > 5 && key.splice(0, 5) === 'site.') {
    //     console.log('kek');
    // }
    return obj[key];
}

export function getByRef(obj, ref) {
    const path = ref.split('/').slice(1);
    let currentObject = obj;

    path.forEach(path_node => {
       currentObject = stepInJson(currentObject, path_node)
    });

    return currentObject;
}
