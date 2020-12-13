//#region Imports
import * as THREE from 'three';

// Setup
import { setup } from './own/setup.js';
import { loadGLTF, loadHDR } from './own/utils/loaders.js';
const container = document.getElementById('canvas-container');
const { renderer, scene, camera, controls, manager } = setup(container);

// Shaders
import vertexShader from './own/shaders/vertex.glsl';
import fragmentShader from './own/shaders/fragment.glsl';

// Libs
import * as dat from 'dat.gui';
const gui = new dat.GUI();

import Stats from 'three/examples/jsm/libs/stats.module.js';
const stats = new Stats();
container.appendChild(stats.dom);
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//#endregion


//#region Light
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(6, 8, -3);
directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffaa, 0.8);
pointLight.position.set(0, 5, 0);
pointLight.shadow.mapSize.width = pointLight.shadow.mapSize.height = 2048;
pointLight.castShadow = true;
scene.add(pointLight);
//#endregion Light


//#region Helpers
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(500, 500, 0xffffff, 0x101010);
scene.add(gridHelper)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
scene.add(pointLightHelper);
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

	/** Experiment plane */
	const experimentGeometry = new THREE.PlaneBufferGeometry(3, 3, 40, 40);
	let experimentMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00ffff) });

	// Shader Material
	const waterTexture = new THREE.TextureLoader().load('./static/textures/water.jpg');
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
	const uniforms = {
		time: { value: 0.0 },
		color: { value: new THREE.Color(0xfafafa) },
		colorTexture: { value: waterTexture }
	}
	experimentMaterial = new THREE.ShaderMaterial({
		uniforms,
		vertexShader,
		fragmentShader
	});
	//Иногда необходимо для отображения текстуры
	// experimentMaterial.needsUpdate = true; 
	// Генерация шума для каждой вершины
	const displacement = new Float32Array(experimentGeometry.attributes.position.count);
	for (let i = 1; i < displacement.length; i++) {
		displacement[i] = Math.random() * 0.2;
	}
	// Установка шума неизменным атрибутом
	experimentGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));

	const experimentPlane = new THREE.Mesh(experimentGeometry, experimentMaterial)
	experimentPlane.position.setY(2);
	experimentPlane.castShadow = true;
	experimentPlane.receiveShadow = true;
	experimentPlane.material.side = THREE.DoubleSide;
	scene.add(experimentPlane);

	/** GLTF model */
	const gltf_tree = await loadGLTF('./static/gltf/tree/model.gltf', manager);
	scene.add(gltf_tree.scene);

	gltf_tree.scene.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
			child.position.x = -5;
			scene.add(child);
		}
	});
	//#endregion

	
	//#region Animate
	function animate() {
		uniforms.time.value = performance.now() * 0.003;

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
	gui.remember(directionalLightHelper);
	gui.remember(plane);

	cameraPosition.add(camera.position, 'x').listen().step(0.01);
	cameraPosition.add(camera.position, 'y').listen().step(0.01);
	cameraPosition.add(camera.position, 'z').listen().step(0.01);

	helpers.add(axesHelper, 'visible').name("Axes");
	helpers.add(gridHelper, 'visible').name("Grid");
	helpers.add(directionalLightHelper, 'visible').name("Directional light");
	helpers.add(pointLightHelper, 'visible').name("Point light");

	stuff.add(plane, 'visible').name("Plane");
	//#endregion

})();
