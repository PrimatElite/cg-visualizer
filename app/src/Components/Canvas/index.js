import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import styled from 'styled-components';
import * as d3 from 'd3';
import zoomInit from './zoom';
import draw from "../../Utils/draw";

const Wrapper = styled.div`
  border: 2px solid black;
  width: 75%;
  height: 98vh;
  margin: 10px 10px 0 5px;
`;

class ThreeRendering extends Component {
    createCamera(width, height) {
        const near = 1.5;
        const far = 10;
        const camera = new THREE.PerspectiveCamera(90, width / height, near, far);
        camera.position.set(0, 0, 5);
        return camera;
    }
    createRenderer(width, height) {
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setClearColor('#FFF');
        renderer.setSize(width, height);
        return renderer;
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
        this.renderer.render(this.scene, this.camera);
    };

    clearScene  = () => {
        while(this.scene.children.length > 0){
            this.scene.remove(this.scene.children[0]);
        }
    }

    initScene = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        // threejs setup
        this.scene = new THREE.Scene();
        this.camera = this.createCamera(width, height);
        this.renderer = this.createRenderer(width, height);

        // setup zoom handling
        const zoom = zoomInit(this.camera, width, height);
        const view = d3.select(this.renderer.domElement);
        view.call(zoom);
        view.on('dblclick.zoom', null);
        zoom.scaleTo(view, this.camera.far);

        window.addEventListener('resize', this.handleResize);
        this.mount.appendChild(this.renderer.domElement);
    }

    componentDidMount() {
        this.initScene();
        this.start();
    }

    componentDidUpdate() {
        if (this.props.loading)  {
            this.clearScene();
            // TODO: show loading indicator
        }
        if (this.props.data !== this.data) {
            this.clearScene();
            this.data = this.props.data;
            draw(this.scene, this.data);
            console.log(this.scene.children.length)
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