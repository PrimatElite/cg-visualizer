import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import styled from 'styled-components';
import * as d3 from 'd3';
import setUpZoom from './zoom';
import draw from "../../Utils/draw";
import SceneManager from "./SceneManager";

const Wrapper = styled.div`
  border: 2px solid black;
  width: 75%;
  height: 98vh;
  margin: 10px 10px 0 5px;
`;

class ThreeRendering extends Component {
    constructor() {
        super();
        this.fov = 90;
        this.far = 2000;
        this.near = 1.5;
    }
    createCamera(width, height) {
        return new THREE.PerspectiveCamera(this.fov, width / height, this.near, this.far);
    }
    createRenderer(width, height) {
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setClearColor('#FFF');
        renderer.setSize(width, height);
        return renderer;
    }
    createZoomHandling(sceneManager, camera, width, height) {
        const screenDimensions = { width, height };
        const view = d3.select(this.renderer.domElement);
        setUpZoom(sceneManager, view, camera, this.fov, this.far, this.near, screenDimensions);
    }
    handleResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    };
    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    };
    stop = () => {
        cancelAnimationFrame(this.frameId);
    };
    animate = () => {
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };
    renderScene = () => {
        this.renderer.render(this.sceneManager.scene, this.camera);
    };

    initScene = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.sceneManager = new SceneManager({x: 0, y: 0}, { width, height });
        this.camera = this.createCamera(width, height);
        this.renderer = this.createRenderer(width, height);

        this.createZoomHandling(this.sceneManager, this.camera, width, height);

        window.addEventListener('resize', this.handleResize);
        this.mount.appendChild(this.renderer.domElement);
    }

    componentDidMount() {
        this.initScene();
        this.start();
    }

    componentDidUpdate() {
        if (this.props.data !== this.data) {
            this.data = this.props.data;
            const sceneObjects = draw(this.data);
            this.sceneManager.updateScene(sceneObjects);
        }

        this.animate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize');
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }
    render() {
        return (
            <Wrapper
                ref={mount => {
                    this.mount = mount;
                }}
            />
        );
    }
}

ThreeRendering.propTypes = {
    data: PropTypes.object,
    loading: PropTypes.bool.isRequired,
};

export default ThreeRendering;