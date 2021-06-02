import { WebGLRenderer, Scene, PerspectiveCamera, LoadingManager } from 'three';
// import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Interaction } from '../../node_modules/three.interaction/src/index';
// const Interaction = require('three.interaction')
// import { Interaction } from 'three.interaction';

export default class Setup {
	constructor(container) {

		this.container = container;

		this.renderer = (options) => {
			return new WebGLRenderer(options || {
				powerPreference: "high-performance",
				antialias: true,
				// alpha: true, // Transparent canvas
				// preserveDrawingBuffer: true // For screenshot
			});
		}

		this.scene = () => {
			return new Scene();
		}

		this.camera = (width, height) => {
			const FOV = 45;
			const ASPECT = width / height;
			const NEAR = 0.1;
			const FAR = 500;
			return new PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
		}

		this.controls = (camera, element) => {
			return new OrbitControls(camera, element);
		}

		this.manager = () => {
			return new LoadingManager();
		}

		this.interaction = (renderer, scene, camera) => {
			return new Interaction(renderer, scene, camera)
		}

	}

	init(onResize = () => { }) {
		const aspectWidth = this.container.offsetWidth;
		const aspectHeight = this.container.offsetHeight;

		const renderer = this.renderer();
		const scene = this.scene();
		const camera = this.camera(aspectWidth, aspectHeight);
		const controls = this.controls(camera, renderer.domElement);
		const manager = this.manager();
		const interaction = this.interaction(renderer, scene, camera);

		renderer.setSize(aspectWidth, aspectHeight);

		// renderer.outputEncoding = THREE.sRGBEncoding;
		// renderer.toneMapping = THREE.ACESFilmicToneMapping;
		// renderer.shadowMap.enabled = true;
		// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		renderer.setPixelRatio(window.devicePixelRatio);

		camera.position.set(-4, 2.5, 10);
		camera.lookAt(0, 2.5, 0);
		camera.updateProjectionMatrix();

		this.container.appendChild(renderer.domElement);

		window.addEventListener('resize', () => {
			const aspectWidth = this.container.offsetWidth;
			const aspectHeight = this.container.offsetHeight;

			renderer.setSize(aspectWidth, aspectHeight);
			camera.aspect = aspectWidth / aspectHeight;
			camera.updateProjectionMatrix();

			onResize();
		}, false);

		return { renderer, scene, camera, controls, manager, interaction }
	}
}
