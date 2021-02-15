import * as THREE from 'three';

import { setup } from './modules/setup.js';
import { loadGLTF, loadHDR } from './modules/utils/loaders.js';
import DevTools from "./modules/dev/devtools";

import vertexShader_water from './shaders/water/vertex.glsl';
import fragmentShader_water from './shaders/water/fragment.glsl';
import vertexShader_sphere from './shaders/sphere/vertex.glsl';
import fragmentShader_sphere from './shaders/sphere/fragment.glsl';

const container = document.getElementById('canvas-container');
const { renderer, scene, camera, controls, manager } = setup(container);
const devtools = new DevTools({ container, renderer, scene, camera, controls });

(async function () {

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

	//#region Items

	/** HDR */
	await loadHDR('./static/hdr/studio_sm.hdr', renderer, scene, manager);

	/** Plane */
	const planeGeometry = new THREE.PlaneBufferGeometry(30, 30);
	planeGeometry.rotateX(- Math.PI / 2);
	// const planeTexture = new THREE.TextureLoader().load('./static/textures/checkerboard.jpg');
	// planeTexture.repeat.x = planeTexture.repeat.y = 25;
	const planeTexture = new THREE.TextureLoader().load('./static/textures/uvgrid.jpg');
	planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
	planeTexture.needsUpdate = true;
	const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, map: planeTexture }));
	plane.receiveShadow = true;
	plane.name = 'plane';
	scene.add(plane);

	// Uniforms
	const waterTexture = new THREE.TextureLoader().load('./static/textures/water.jpg');
	const explosionTexture = new THREE.TextureLoader().load('./static/textures/explosion.png');
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
	const uniforms = {
		time: { value: 0.0 },
		color: { value: new THREE.Color(0xfafafa) },
		tWater: { value: waterTexture },
		tExplosion: { value: explosionTexture }
	}

	/** Experiment plane */
	const experimentPlaneGeometry = new THREE.PlaneBufferGeometry(3, 3, 30, 30);
	// const experimentPlaneMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00ffff) });
	const experimentPlaneMaterial = new THREE.ShaderMaterial({
		uniforms,
		vertexShader: vertexShader_water,
		fragmentShader: fragmentShader_water
	});
	//Иногда необходимо для отображения текстуры
	// experimentPlaneMaterial.needsUpdate = true;

	// Генерация шума для каждой вершины
	const displacement = new Float32Array(experimentPlaneGeometry.attributes.position.count);
	for (let i = 1; i < displacement.length; i++) {
		displacement[i] = Math.random() * 0.2;
	}
	// Установка шума неизменным атрибутом
	experimentPlaneGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));

	const experimentPlane = new THREE.Mesh(experimentPlaneGeometry, experimentPlaneMaterial)
	experimentPlane.position.setY(2);
	experimentPlane.castShadow = true;
	experimentPlane.receiveShadow = true;
	experimentPlane.material.side = THREE.DoubleSide;
	scene.add(experimentPlane);

	/** Experiment sphere */
	const experimentSphereMaterial = new THREE.ShaderMaterial({
		uniforms,
		vertexShader: vertexShader_sphere,
		fragmentShader: fragmentShader_sphere,
	});
	const experimentSphere = new THREE.Mesh(
		new THREE.IcosahedronGeometry(2, 30),
		experimentSphereMaterial
	);
	scene.add(experimentSphere);
	experimentSphere.position.set(5, 2, 0);

	/** GLTF model */
	const gltf_tree = await loadGLTF('./static/gltf/tree/model.gltf', manager);
	scene.add(gltf_tree.scene);
	gltf_tree.scene.traverse(child => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
			child.position.x = -3;
		}
	});
	//#endregion

	//#region Animate
	function animate() {
		uniforms.time.value = performance.now() * 0.003;

		experimentSphere.rotation.x += 0.002;
		experimentSphere.rotation.y += 0.002;
		experimentSphere.rotation.z += 0.002;

		//DEV
		devtools.update();

		//PROD
		//controls.update();
		//renderer.render(scene, camera);

		requestAnimationFrame(animate);
	}
	animate();

	//#endregion

})();
