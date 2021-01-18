function stepInJson(obj, key) {
    if (key.startsWith('side.')) {
        key = parseInt(key.slice(5));
        const len = obj.length;
        if (len === undefined || obj[key].type !== 'point' || obj[(key + 1) % len].type !== 'point') { // Point element
            throw new Error('Unsupported reference'); // TODO make beautiful error handler
        }
        return [obj[key], obj[(key + 1) % len]]
    }
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
