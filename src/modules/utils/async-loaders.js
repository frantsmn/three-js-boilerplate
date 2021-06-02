/* eslint-disable no-unused-vars */

import { UnsignedByteType, PMREMGenerator } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

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
				undefined,
				// progress => {console.log('Loading progress...', progress)},
				error => {
					console.error('loadGLTF()', error);
					reject(error);
				});
	});
}

function loadHDR(path, renderer, scene, manager) {
	return new Promise((resolve, reject) => {
		const loader = new RGBELoader(manager);
		loader.setDataType(UnsignedByteType);
		loader
			.load(path,
				texture => {

					// PMREM GENERATOR
					const pmremGenerator = new PMREMGenerator(renderer);
					pmremGenerator.compileEquirectangularShader();

					// const envMap = pmremGenerator.fromEquirectangular(texture).texture;
					// this.scene.background = envMap;
					scene.environment = pmremGenerator.fromEquirectangular(texture).texture;

					texture.dispose();
					pmremGenerator.dispose();

					resolve(texture);
				},
				undefined,
				// progress => {console.log('Loading progress...', progress)},
				error => {
					console.log('loadHDR()', error);
					reject(error);
				});
	});
}

export { loadGLTF, loadHDR }