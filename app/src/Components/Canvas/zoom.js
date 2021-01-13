import * as d3 from 'd3';

function getCurrentScale(camera, height) {
    const vFOV = (camera.fov * Math.PI) / 180;
    const scale_height = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const currentScale = height / scale_height;
    return currentScale;
}

export default function zoomInit(camera, width, height) {
    const handler = event => {
        if (event.sourceEvent) {
            if (event.sourceEvent.type === "wheel") {
                const new_z = event.transform.k;
                camera.position.set(camera.position.x, camera.position.y, new_z);
            } else {
                // Handle panning
                const { movementX, movementY } = event.sourceEvent;

                // Adjust mouse movement by current scale and set camera
                const current_scale = getCurrentScale(camera, height);
                camera.position.set(
                    camera.position.x - movementX / current_scale,
                    camera.position.y + movementY / current_scale,
                    camera.position.z
                );
            }
        }
    };

    return d3
        .zoom()
        .scaleExtent([camera.near, camera.far])
        .on('zoom', handler);
}