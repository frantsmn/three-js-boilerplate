//#region Imports
import * as THREE from 'three';

// Own
import { setup } from './own/setup.js';
import { loadGLTF, loadHDR } from './own/utils/loaders.js';
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
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(6, 8, -3);
directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;
directionalLight.castShadow = true;
scene.add(directionalLight);
//#endregion Light


//#region Helpers
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(500, 500, 0xffffff, 0x101010);
scene.add(gridHelper)

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1)
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
scene.add(directionalLightHelper);
//#endregion


(async function () {

	//#region Items

	/** HDR */
	await loadHDR('./static/hdr/studio_sm.hdr', renderer, scene, manager);

	/** Plane */
	const planeGeometry = new THREE.PlaneBufferGeometry(30, 30);
	planeGeometry.rotateX(- Math.PI / 2);
	const planeTexture = new THREE.TextureLoader().load('./static/textures/checkerboard.jpg');
	planeTexture.repeat.x = planeTexture.repeat.y = 25;
	planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
	const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, map: planeTexture }));
	plane.receiveShadow = true;
	plane.name = 'plane';
	scene.add(plane);

	/** GLTF model */
	const gltf_tree = await loadGLTF('./static/gltf/tree/model.gltf', manager);
	gltf_tree.scene.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;

			scene.add(child);
		}
	});
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

	gui.remember(camera.position);
	gui.remember(axesHelper);
	gui.remember(gridHelper);
	gui.remember(hemisphereLightHelper);
	gui.remember(directionalLightHelper);
	gui.remember(plane);

	cameraPosition.add(camera.position, 'x').listen().step(0.01);
	cameraPosition.add(camera.position, 'y').listen().step(0.01);
	cameraPosition.add(camera.position, 'z').listen().step(0.01);

	helpers.add(axesHelper, 'visible').name("Axes");
	helpers.add(gridHelper, 'visible').name("Grid");
	helpers.add(hemisphereLightHelper, 'visible').name("Hemisphere light");
	helpers.add(directionalLightHelper, 'visible').name("Directional light");

	stuff.add(plane, 'visible').name("Plane");
	//#endregion

})();
