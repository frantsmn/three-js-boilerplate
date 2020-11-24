import * as THREE from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

/** 
	 * @method tweenCameraFlyTo Анимированное перемещение камеры к объекту
	 * @param {string} targetName - наименование элемента сцены
	 * @param {number} duration - длительность анимации в ms (`1000` по умолчанию)
	 */
export function tweenCameraFlyTo(targetName, duration = 1000, camera, controls) {
	const target = this.scene.getObjectByName(targetName);

	new TWEEN.Tween(camera.position)
		.to(target.position, duration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

	controls.enabled = false;
	setTimeout(() => {
		controls.enabled = true;
	}, duration);
}

/** 
 * @method tweenCameraLookAt Анимированное перемещение центра вращения камеры
 * @param {string} targetName - наименование элемента сцены
 * @param {number} duration - длительность анимации в ms (`1000` по умолчанию)
 */
export function tweenCameraLookAt(pos, duration = 1000, camera, controls) {
	// const target = this.scene.getObjectByName(targetName);

	// const newPosition = new THREE.Vector3(x, y, z);

	// console.log('controls', controls);

	new TWEEN.Tween(controls.target)
		.to(pos, duration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

	new TWEEN.Tween(controls.target0)
		.to(pos, duration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

	new TWEEN.Tween(controls.position)
		.to(pos, duration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();

	new TWEEN.Tween(controls.position0)
		.to(pos, duration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start();
}

/** 
 * @method tweenSetCameraPosition Анимированное перемещение камеры вокруг центра вращения
 * @param {object} position - координаты `{x, y, z}`
 * @param {number} duration - длительность анимации в ms (`1000` по умолчанию)
 * @returns {Promise} `Promise` возвращает промис выполнения анимации
 */
export function tweenSetCameraPosition(position, duration = 1000, camera, controls) {
	const newPosition = new THREE.Vector3(position.x, position.y, position.z);
	return new Promise((resolve, reject) => {
		new TWEEN.Tween(camera.position)
			.to(newPosition, duration)
			.easing(TWEEN.Easing.Quadratic.Out)
			.start();
		setTimeout(() => {
			resolve();
		}, duration);
	});
}