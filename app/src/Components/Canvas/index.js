import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import styled from 'styled-components';
import * as d3 from 'd3';
import zoomInit from './zoom';

const Wrapper = styled.div`
  width: inherit;
  border: 2px solid black;
  height: 98vh;
  margin: 10px;
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
    componentDidMount() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        // threejs setup
        this.scene = new THREE.Scene();
        this.camera = this.createCamera(width, height);
        this.renderer = this.createRenderer(width, height);

        const geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3( -1,  1, 0 ),
            new THREE.Vector3( -1, -1, 0 ),
            new THREE.Vector3(  1, -1, 0 )
        );

        geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

        geometry.computeBoundingSphere();
        const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        // const curve = new THREE.EllipseCurve(
        //     5,  0,            // ax, aY
        //     10, 10,           // xRadius, yRadius
        //     0,  2 * Math.PI,  // aStartAngle, aEndAngle
        //     false,            // aClockwise
        //     0                 // aRotation
        // );
        //
        // const points = curve.getPoints( 50 );
        // const geometry = new THREE.BufferGeometry().setFromPoints( points );
        //
        // const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        //
        // // Create the final object to add to the scene
        console.log(geometry.boundingSphere)
        const { x, y } = geometry.boundingSphere.center;
        const radius = geometry.boundingSphere.radius;
        const curve = new THREE.EllipseCurve(
            x, y,            // ax, aY
            radius, radius,           // xRadius, yRadius
            0,  2 * Math.PI,  // aStartAngle, aEndAngle
            false,            // aClockwise
            0                 // aRotation
        );
        const points = curve.getPoints( 50 );
        const geometry2 = new THREE.BufferGeometry().setFromPoints( points );
        const ellipse = new THREE.Line( geometry2, material );
        this.scene.add( ellipse );

        // setup zoom handling
        const zoom = zoomInit(this.camera, width, height);
        const view = d3.select(this.renderer.domElement);
        view.call(zoom);
        view.on('dblclick.zoom', null);
        zoom.scaleTo(view, this.camera.far);

        window.addEventListener('resize', this.handleResize);
        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    componentDidUpdate() {
        console.log(this.scene.children.length);
        if (this.props.isLoading) {
            // clear scene
            while (this.scene.children.length > 0) {
                this.scene.remove(this.scene.children[0]);
            }
        } else {
            if (this.scene.children.length === 0) {
                const geometry = new THREE.BoxGeometry();
                const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
                const cube = new THREE.Mesh( geometry, material );
                this.scene.add( cube );
            }
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
    objects: PropTypes.any,
    isLoading: PropTypes.bool,
};

export default ThreeRendering;