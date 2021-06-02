import * as THREE from 'three';

// Setup
import Setup from './modules/setup';
const container = document.getElementById('canvas-container');
const setup = new Setup(container);
const { renderer, scene, camera, controls, manager } = setup.init();

// Preloader
import Preloader from './modules/utils/preloader';
new Preloader({ manager });

// Devtools 
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
	import('./modules/dev/devtools').then(module => {
		const DevTools = module.default;
		window.devtools = new DevTools({ container, renderer, scene, camera, controls });
	});
}

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

	waterfall.animate = true;
	waterfall.on('click', (event) => {
		console.log(event);
		waterfall.animate = !waterfall.animate;
	})

	function animate() {
		uniforms.time.value = performance.now() * 0.003;

		if (waterfall.animate) {
			waterfall.position.y += Math.sin(performance.now() * 0.005) * 0.01;
		}

		fireball.rotation.x += 0.01;
		fireball.rotation.y += 0.01;
		fireball.rotation.z += 0.01;

		// eslint-disable-next-line no-undef
		if (process.env.NODE_ENV !== 'production') {
			// DEVELOPMENT MODE
			window.devtools.update();
		} else {
			// PRODUCTION MODE
			controls.update();
			renderer.render(scene, camera);
		}

		requestAnimationFrame(animate);
	}
	animate();

}; app();