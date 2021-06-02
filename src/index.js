import {
	TextureLoader,
	Color,
	RepeatWrapping,
	Vector3
} from 'three';

import TWEEN from '@tweenjs/tween.js';

// Setup
import Setup from './modules/setup';
const container = document.getElementById('canvas-container');
const setup = new Setup(container);
const { renderer, scene, camera, controls, manager } = setup.init();

// Scene navigation
import IndoorNavigation from './modules/utils/scene-navigation'

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
// import Annotations from './modules/utils/annotations';

// Uniforms
const waterTexture = new TextureLoader().load('./static/textures/water.jpg');
const explosionTexture = new TextureLoader().load('./static/textures/explosion.png');
waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;
const uniforms = {
	time: { value: 0.0 },
	color: { value: new Color(0xfafafa) },
	tWater: { value: waterTexture },
	tExplosion: { value: explosionTexture }
}

// App
const app = async () => {

	const { init: baseInit } = new BaseObject({ renderer, scene, manager });
	const { mesh: fireball } = new FireballObject({ scene, uniforms });
	const { mesh: waterfall } = new WaterfallObject({ scene, uniforms });

	await baseInit();

	new IndoorNavigation({ scene, camera, controls, TWEEN });

	// const annotations = new Annotations({ renderer, scene, camera });
	// annotations.createAnnotation({
	// 	selector: '.annotation1',
	// 	position: new Vector3(-6, 3, 4),
	// 	showDirectionIcon: true,
	// 	meshName: 'waterfall',
	// 	onClick: () => { },
	// 	onRemove: (annotation) => {
	// 		annotation.element.style.opacity = 0
	// 	}
	// });
	// annotations.createAnnotation({
	// 	selector: '.annotation2',
	// 	position: new Vector3(-4, 0, -4),
	// 	showDirectionIcon: true,
	// 	onRemove: (annotation) => {
	// 		annotation.element.style.opacity = 0
	// 	}
	// });

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
			window.devtools && window.devtools.update();
		} else {
			// PRODUCTION MODE
			controls.update();
			renderer.render(scene, camera);
		}

		TWEEN.update();
		// annotations.update();
		requestAnimationFrame(animate);
	}
	animate();

}; app();