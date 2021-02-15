import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import * as dat from 'dat.gui'

export default class DevTools {
	constructor({ container, renderer, scene, camera, controls }) {
		//#region [init]
		if (window.___threejsdevtools) return; window.___threejsdevtools = true; // От переинициализации при hotreload 
		if (!container) { console.error('[devtools.js]: "container" required!'); return; }
		if (!renderer) { console.error('[devtools.js]: "renderer" required!'); return; }
		if (!scene) { console.error('[devtools.js]: "scene" required!'); return; }
		if (!camera) { console.error('[devtools.js]: "camera" required!'); return; }
		window.addEventListener('resize', () => this.onResize(), false);

		this.container = container;
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;

		// Initial state
		this._isDebugMode = false;
		this.activeCamera = this.camera;

		// Debug camera
		this.debugCamera = this.camera.clone();
		this.scene.add(this.debugCamera);

		// Controls
		this.debugControls = new OrbitControls(this.debugCamera, this.renderer.domElement);
		this.debugControls.keys = {
			UP: 87,		//W
			LEFT: 65,	//A
			BOTTOM: 83,	//S
			RIGHT: 68,	//D
		};
		// this.debugControls.listenToKeyEvents(window);
		this.debugControls.enableKeys = true;
		this.debugControls.keyPanSpeed = 100;
		this.debugControls.enableDamping = true;
		this.debugControls.dampingFactor = 0.1;
		this.debugControls.screenSpacePanning = false;

		// Helpers
		this.helpers = {
			axes: new THREE.AxesHelper(500),
			grid: new THREE.GridHelper(500, 500, 0xffffff, 0x101010),
			camera: new THREE.CameraHelper(this.camera),
			debugCamera: new THREE.CameraHelper(this.debugCamera),
		};

		// HTML label
		this.debugCameraLabel = document.createElement('div');
		this.debugCameraLabel.innerText = 'debug mode';
		this.debugCameraLabel.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);padding:3px 5px;background:#000;color:#fff;font-family:monospace;font-size:10px;border-radius: 0 0 5px 5px';
		document.body.appendChild(this.debugCameraLabel);

		// Stats
		this.stats = new Stats();
		this.container.appendChild(this.stats.domElement);
		this.stats.domElement.style.cssText = 'position:absolute;bottom:0;left:0;';
		this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		//#endregion

		//#region [gui]
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
		this.gui.__folders["Camera position"].add(this.camera.position, 'x').listen().step(0.01);
		this.gui.__folders["Camera position"].add(this.camera.position, 'y').listen().step(0.01);
		this.gui.__folders["Camera position"].add(this.camera.position, 'z').listen().step(0.01);

		this.gui.addFolder('Debug camera position');
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'x').listen().step(0.01);
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'y').listen().step(0.01);
		this.gui.__folders["Debug camera position"].add(this.debugCamera.position, 'z').listen().step(0.01);

		this.gui.add(this, 'isDebugMode').name('Debug mode');
		//#endregion
	}

	update() {
		// Controls
		if (this.debugControls.enabled) this.debugControls.update();
		if (this.controls && this.controls.enabled) this.controls.update();

		// Camera
		this.camera.updateMatrixWorld();

		// Render
		this.renderer.render(this.scene, this.activeCamera);

		// Stats
		this.stats && this.stats.update();
	}

	enableDevMode() {
		// Helpers
		for (const key in this.helpers)
			if (Object.hasOwnProperty.call(this.helpers, key))
				this.scene.add(this.helpers[key])

		// Controls
		this.debugControls.enabled = true;
		if (this.controls) this.controls.enabled = false;
		if (this.controls) this.controls.domElement = null;

		// Camera
		this.activeCamera = this.debugCamera;

		// HTML label
		this.debugCameraLabel.style.display = 'block';

		// Flag
		this._isDebugMode = true;
	}

	disableDevMode() {
		// Helpers
		for (const key in this.helpers)
			if (Object.hasOwnProperty.call(this.helpers, key))
				this.scene.remove(this.helpers[key])

		// Controls
		this.debugControls.enabled = false;
		if (this.controls) this.controls.enabled = true;

		// Camera
		this.activeCamera = this.camera;

		// HTML label
		this.debugCameraLabel.style.display = 'none';

		// Flag
		this._isDebugMode = false;
	}

	onResize() {
		const aspectWidth = this.container.offsetWidth;
		const aspectHeight = this.container.offsetHeight;
		this.renderer.setSize(aspectWidth, aspectHeight);
		this.activeCamera.aspect = aspectWidth / aspectHeight;
		this.activeCamera.updateProjectionMatrix();
		this.helpers.debugCamera.update();
		this.helpers.camera.update();
	}

	set isDebugMode(value) {
		if (value) { this.enableDevMode() }
		else { this.disableDevMode(); }
		this.onResize();
	}

	get isDebugMode() {
		return this._isDebugMode;
	}

}
