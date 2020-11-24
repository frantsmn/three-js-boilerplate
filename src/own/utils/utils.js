import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


//TODO Доработать (не центрируется относительно модели)
function createOutlineMesh(mesh, scale = 0.05) {
	const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
	const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
	outlineMesh.position.copy(mesh.position);
	outlineMesh.scale.copy(mesh.scale).multiplyScalar(1.0 + scale);
	outlineMesh.name = `${mesh.name}_outline`;
	console.log('OUTLINE_MESH', outlineMesh.name);
	outlineMesh.visible = false;
	return outlineMesh;
}

function createRollOverMarker() {
	const rollOverMarker = new THREE.Group();
	const circleGeometry = new THREE.CircleGeometry(1, 8, 0);
	const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
	const rollOverMarkerCircle = new THREE.Mesh(circleGeometry, circleMaterial);
	const ringGeometry = new THREE.RingGeometry(0.7, 1, 100);
	const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const rollOverMarkerRing = new THREE.Mesh(ringGeometry, ringMaterial);
	rollOverMarker.add(rollOverMarkerCircle);
	rollOverMarker.add(rollOverMarkerRing);
	rollOverMarker.rotateX(- Math.PI / 2);
	// rollOverMarker.translate(0, 1.8, 0);
	rollOverMarker.name = 'roll_over_marker';
	return rollOverMarker;
}

function loadGLTF(path, manager) {
	return new Promise((resolve, reject) => {
		new GLTFLoader(manager)
			.load(path,
				gltf => {
					gltf.scene.traverse(child => {
						if (child.isMesh) {
							child.castShadow = true;
							child.receiveShadow = true;
						}
					});
					resolve(gltf);
				},
				progress => { console.log('Loading progress...', progress) },
				error => { reject(); console.error('loadGLTF()', error); }
			);
	});
}

function loadHDR(path, renderer, scene, manager) {
	return new Promise((resolve, reject) => {
		const loader = new RGBELoader(manager);
		loader.setDataType(THREE.UnsignedByteType);

		loader
			.load(
				path,
				texture => {

					// PMREM GENERATOR
					const pmremGenerator = new THREE.PMREMGenerator(renderer);
					pmremGenerator.compileEquirectangularShader();

					// const envMap = pmremGenerator.fromEquirectangular(texture).texture;
					// this.scene.background = envMap;
					scene.environment = pmremGenerator.fromEquirectangular(texture).texture;

					texture.dispose();
					pmremGenerator.dispose();

					resolve(texture);
				},
				// called while loading is progressing
				function (xhr) {
					console.log((xhr.loaded / xhr.total * 100) + '% HDR loaded');
				},
				// called when loading has errors
				function (error) {
					console.log('loadHDR()', error);
					reject(error);
				});
	});
}

export {
	createOutlineMesh,
	createRollOverMarker,
	loadGLTF,
	loadHDR
}