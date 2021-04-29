import * as THREE from 'three';

// Setup
import { setup } from './modules/setup';
const container = document.getElementById('canvas-container');
const { renderer, scene, camera, controls, manager } = setup(container);

// Preloader
import Preloader from './modules/utils/preloader';
new Preloader({ manager });

// Devtools
import DevTools from "./modules/dev/devtools";
const devtools = new DevTools({ container, renderer, scene, camera, controls });

// Objects
import BaseObject from './objects/base';
import WaterfallObject from './objects/waterfall';
import FireballObject from './objects/fireball';

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

// App
const app = async () => {

	const { init: baseInit } = new BaseObject({ renderer, scene, manager });
	const { mesh: fireball } = new FireballObject({ scene, uniforms });
	const { mesh: waterfall } = new WaterfallObject({ scene, uniforms });

	await baseInit();

	function animate() {
		uniforms.time.value = performance.now() * 0.003;

		fireball.rotation.x += 0.01;
		fireball.rotation.y += 0.01;
		fireball.rotation.z += 0.01;

		//DEV
		devtools.update();

		//PROD
		//controls.update();
		//renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}
	animate();

}; app();