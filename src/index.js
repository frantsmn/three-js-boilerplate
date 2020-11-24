//#region Imports
import * as THREE from 'three';

// Own
import { setup } from './own/setup.js';
import { loadGLTF, loadHDR } from './own/utils/utils.js';
const container = document.getElementById('canvas-container');
const { renderer, scene, camera, controls, manager } = setup(container);

// Libs
import * as dat from 'dat.gui';
const gui = new dat.GUI();

import Stats from 'three/examples/jsm/libs/stats.module.js';
const stats = new Stats();
container.appendChild(stats.dom);
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//#endregion


//#region Light
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
hemiLight.position.set(0, 5, 0);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(6, 8, -3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

scene.add(hemiLight);
scene.add(directionalLight);
//#endregion Light


//#region Helpers
const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
const gridHelper = new THREE.GridHelper(500, 500, 0xffffff, 0x101010);
const axesHelper = new THREE.AxesHelper(500);

scene.add(hemiLightHelper);
scene.add(directionalLightHelper);
scene.add(gridHelper);
scene.add(axesHelper);
//#endregion


(async function () {

	//#region Items
	const texture = new THREE.TextureLoader().load('./static/textures/Checkerboard.jpg');
	texture.repeat.x = 25;
	texture.repeat.y = 25;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	await loadHDR('./static/hdr/studio_sm.hdr', renderer, scene, manager);
	const gltf_tree = await loadGLTF('./static/gltf/tree/model.gltf', manager);
	gltf_tree.scene.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;

			scene.add(child);
		}
	});

	const geometry = new THREE.PlaneBufferGeometry(30, 30);
	geometry.rotateX(- Math.PI / 2);
	const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture }));
	plane.name = 'plane';
	plane.receiveShadow = true;

	scene.add(plane);
	//#endregion


	//#region Animate
	function animate() {
		stats.update();
		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}
	animate();
	//#endregion


	//#region GUI
	const cameraPosition = gui.addFolder('Camera position');
	const stuff = gui.addFolder('Stuff');
	const helpers = gui.addFolder('Helpers');

	cameraPosition.add(camera.position, 'x').listen().step(0.01);
	cameraPosition.add(camera.position, 'y').listen().step(0.01);
	cameraPosition.add(camera.position, 'z').listen().step(0.01);

	helpers.add(gridHelper, 'visible').name("Grid");
	helpers.add(axesHelper, 'visible').name("Axes");
	helpers.add(hemiLightHelper, 'visible').name("Hemisphere light");
	helpers.add(directionalLightHelper, 'visible').name("Directional light");

	stuff.add(plane, 'visible').name("Plane");
	//#endregion

})();
