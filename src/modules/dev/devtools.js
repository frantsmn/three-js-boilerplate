import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import * as dat from 'dat.gui';

export default class DevTools {
	constructor({ components, stats }) {

		if (components) { this.components = components } else { console.error('[devtools.js]: "components" property required!'); return; }
		if (!components.container) { console.error('[devtools.js]: "components.container" property required!'); return; }
		if (!components.scene) { console.error('[devtools.js]: "components.scene" property required!'); return; }
		if (!components.camera) { console.error('[devtools.js]: "components.camera" property required!'); return; }
		if (stats) this.addStats();
		window.addEventListener('resize', this.onResize, false);

		//#region [debug camera]
		const cameraSettings = {
			FOV: 45,
			ASPECT: this.components.container.offsetWidth / this.components.container.offsetHeight,
			NEAR: 0.1,
			FAR: 500,
		}
		this.debugCamera = new THREE.PerspectiveCamera(
			cameraSettings.FOV,
			cameraSettings.ASPECT,
			cameraSettings.NEAR,
			cameraSettings.FAR
		);
		this.debugCamera.position.copy(this.components.camera.position);
		this.components.scene.add(this.debugCamera);

		// Controls
		this.debugControls = new OrbitControls(this.debugCamera, this.components.renderer.domElement);
		this.debugControls.keys = {
			UP: 87,			//W
			LEFT: 65,		//A
			BOTTOM: 83,	//S
			RIGHT: 68,	//D
		};
		this.debugControls.keyPanSpeed = 15;
		this.debugControls.enableDamping = true;
		this.debugControls.dampingFactor = 0.1;
		this.debugControls.screenSpacePanning = false;

		// Label
		this.debugCameraLabel = document.createElement('div');
		this.debugCameraLabel.innerText = 'debug camera';
		this.debugCameraLabel.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);border:solid 1px white;padding:5px;background:#000;color:#fff;font-family:monospace;';
		document.body.appendChild(this.debugCameraLabel);
		//#endregion

		//#region [state]
		this.__isDebugCameraActive = false;
		this.activeCamera = this.components.camera;
		//#endregion

		//#region [helpers]
		this.helpers = {
			axes: new THREE.AxesHelper(500),
			grid: new THREE.GridHelper(500, 500, 0xffffff, 0x101010),
			camera: new THREE.CameraHelper(this.components.camera),
			debugCamera: new THREE.CameraHelper(this.debugCamera),
		};
		this.components.scene.add(
			this.helpers.axes,
			this.helpers.grid,
			this.helpers.camera,
			this.helpers.debugCamera
		);
		//#endregion

		//#region [gui}
		this.gui = new dat.GUI();
		this.gui.domElement.style.float = 'left';
		this.gui.useLocalStorage = true;

		this.gui.remember(this.helpers.axes);
		this.gui.remember(this.helpers.grid);
		this.gui.remember(this.helpers.camera);
		this.gui.remember(this.debugCamera.position);
		this.gui.remember(this);

		this.gui.addFolder('Helpers');
		this.gui.__folders["Helpers"].add(this.helpers.axes, 'visible').name("Axes").listen();
		this.gui.__folders["Helpers"].add(this.helpers.grid, 'visible').name("Grid").listen();
		this.gui.__folders["Helpers"].add(this.helpers.camera, 'visible').name("Camera helper").listen();

		this.gui.addFolder('Camera position');
		this.gui.__folders["Camera position"].add(this.components.camera.position, 'x').listen().step(0.01);
		this.gui.__folders["Camera position"].add(this.components.camera.position, 'y').listen().step(0.01);
		this.gui.__folders["Camera position"].add(this.components.camera.position, 'z').listen().step(0.01);

		this.gui.addFolder('Debug camera position');
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'x').listen().step(0.01);
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'y').listen().step(0.01);
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'z').listen().step(0.01);

		this.gui.add(this, 'isDebugCameraActive').name('Debug camera');
		//#endregion

		return this;
	}

	update() {
		if (this.debugControls.enabled) this.debugControls.update();
		if (this.components.controls && this.components.controls.enabled) this.components.controls.update();

		this.components.renderer.render(this.components.scene, this.activeCamera);
		this.stats && this.stats.update();
	};

	hideHelpers() {
		for (const key in this.helpers) {
			if (Object.hasOwnProperty.call(this.helpers, key)) {
				this.helpers[key].visible = false;
			}
		}
	}

	showHelpers() {
		for (const key in this.helpers) {
			if (Object.hasOwnProperty.call(this.helpers, key)) {
				this.helpers[key].visible = true;
			}
		}
	}

	addStats() {
		this.stats = new Stats();
		this.components.container.appendChild(this.stats.domElement);
		this.stats.domElement.style.cssText = 'position:absolute;bottom:0;left:0;';
		this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	}

	onResize() {
		const aspectWidth = this.components.container.offsetWidth;
		const aspectHeight = this.components.container.offsetHeight;
		this.components.renderer.setSize(aspectWidth, aspectHeight);
		this.activeCamera.aspect = aspectWidth / aspectHeight;
		this.activeCamera.updateProjectionMatrix();
	}

	set isDebugCameraActive(value) {
		if (value) {
			// Debug camera
			this.activeCamera = this.debugCamera;
			this.debugControls.enabled = true;
			if (this.components.controls) this.components.controls.enabled = false;
			this.debugCameraLabel.style.display = 'block';
			this.__isDebugCameraActive = true;
			this.showHelpers();
		} else {
			// Camera
			this.activeCamera = this.components.camera;
			this.debugControls.enabled = false;
			if (this.components.controls) this.components.controls.enabled = true;
			this.debugCameraLabel.style.display = 'none';
			this.__isDebugCameraActive = false;
			this.hideHelpers();
		}
	}

	get isDebugCameraActive() {
		return this.__isDebugCameraActive;
	}

}
