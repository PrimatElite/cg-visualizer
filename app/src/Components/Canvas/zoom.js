import * as d3 from 'd3';
import {toRadians} from "../../Utils/utils";

const setUpZoom = (view, camera, fov, far, near, screenDimensions) => {
    const zoomHandler = d3_transform => {
        let scale = d3_transform.k;
        const { width, height } = screenDimensions;
        let x = -(d3_transform.x - width / 2) / scale;
        let y = (d3_transform.y - height / 2) / scale;
        let z = getZFromScale(scale);
        camera.position.set(x, y, z);
    };
    const getScaleFromZ = (camera_z_position) => {
        let half_fov = fov / 2;
        let half_fov_radians = toRadians(half_fov);
        let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
        let fov_height = half_fov_height * 2;
        return screenDimensions.height / fov_height;
    };
    const getZFromScale = (scale) => {
        let half_fov = fov / 2;
        let half_fov_radians = toRadians(half_fov);
        let scale_height = screenDimensions.height / scale;
        return scale_height / (2 * Math.tan(half_fov_radians));
    };

    const zoom = d3
        .zoom()
        .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
        .on('zoom', event => {
            let d3_transform = event.transform;
            zoomHandler(d3_transform);
        });

    view.call(zoom);
    let initial_scale = getScaleFromZ(near * 10);
    const initial_transform = d3.zoomIdentity
        .translate(screenDimensions.width / 2, screenDimensions.height / 2)
        .scale(initial_scale);
    zoom.transform(view, initial_transform);
}

export default setUpZoom;
