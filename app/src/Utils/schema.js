function stepInJson(obj, key) {
    // if (key.length > 5 && key.splice(0, 5) === 'site.') {
    //     console.log('kek');
    // }
    return obj[key];
}

export function getByRef(obj, ref) {
    const path = ref.split('/').slice(1);
    let currentObject = obj;

    for (let i = 0; i < path.length; i++) {
        currentObject = stepInJson(currentObject, path[i]);
        if (!currentObject) {
            break;
        }
    }

    return currentObject;
}
