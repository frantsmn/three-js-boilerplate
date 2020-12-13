import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


function _renderer(options) {
	return new THREE.WebGLRenderer(options || {
		powerPreference: "high-performance",
		antialias: true,
		alpha: true, // Transparent canvas
		// preserveDrawingBuffer: true // For screenshot
	});
}

const _scene = () => {
	return new THREE.Scene();
}

const _camera = (width, height) => {
	const FOV = 45;
	const ASPECT = width / height;
	const NEAR = 0.1;
	const FAR = 1000;
	return new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
}

const _controls = (camera, element) => {
	return new OrbitControls(camera, element);
}

const _manager = () => {
	return new THREE.LoadingManager();
}

// Экспорт отдельных модулей без инициализации
export {
	_renderer as renderer,
	_scene as scene,
	_camera as camera,
	_controls as controls,
	_manager as manager
}

// Экспорт сетапа
export function setup(container, onResize = () => { }) {
	const aspectWidth = container.offsetWidth;
	const aspectHeight = container.offsetHeight;

	const renderer = _renderer();
	const scene = _scene();
	const camera = _camera(aspectWidth, aspectHeight);
	const controls = _controls(camera, renderer.domElement);
	const manager = _manager();

	renderer.setSize(aspectWidth, aspectHeight);

	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

	camera.position.set(-4, 4, 10);
	camera.lookAt(0, 0, 0);

	container.appendChild(renderer.domElement);

	window.addEventListener('resize', () => {
		const aspectWidth = container.offsetWidth;
		const aspectHeight = container.offsetHeight;

		renderer.setSize(aspectWidth, aspectHeight);
		camera.aspect = aspectWidth / aspectHeight;
		camera.updateProjectionMatrix();

		onResize();
	}, false);

	return { renderer, scene, camera, controls, manager }
}
