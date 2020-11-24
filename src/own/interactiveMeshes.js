import * as THREE from 'three';

export default class InteractiveMeshes {

	constructor(options) {
		this.container = options.container;
		this.items = options.items;
		this.camera = options.camera;
		this.onmousemove = options.onmousemove;
		this.onmouseover = options.onmouseover;
		this.onmouseout = options.onmouseout;
		this.onpointerdown = options.onpointerdown;
		this.onpointerup = options.onpointerup;
		this.onclick = options.onclick;

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		this.mouse.x = this.mouse.x = -999999999; // Set start position out of scene
		this.mouse.y = this.mouse.y = -999999999; // Set start position out of scene
		this.intersect = null;
		this.intersects = [];

		const onCanvasMouseMove = event => {
			event.preventDefault();
			this.mouse.x = (event.layerX / event.target.offsetWidth) * 2 - 1;
			this.mouse.y = - (event.layerY / event.target.offsetHeight) * 2 + 1;
			// this.onmousemove(this.intersects);
		}

		const onCanvasPointerDown = event => {
			event.preventDefault();
			this.mouse.down = true;
			this.mouse.down_Xpos = 0 + Number(this.mouse.x);
			this.mouse.down_Ypos = 0 + Number(this.mouse.y);
			this.onpointerdown(this.intersects);
		}

		const onCanvasPointerUp = event => {
			event.preventDefault();
			this.onpointerup(this.intersects);
			if (
				this.mouse.down &&
				Math.abs(this.mouse.down_Xpos - this.mouse.x) === 0 &&
				Math.abs(this.mouse.down_Ypos - this.mouse.y) === 0
			) {
				this.onclick(this.intersects);
				this.mouse.down = false;
			}
		}

		this.container.addEventListener('pointermove', onCanvasMouseMove, true);
		this.container.addEventListener('pointerdown', onCanvasPointerDown, true);
		this.container.addEventListener('pointerup', onCanvasPointerUp, true);

	}

	handleRaycaster() {
		this.raycaster.setFromCamera(this.mouse, this.camera);
		this.intersects = this.raycaster.intersectObjects(this.items);

		//onmouseover/out
		if (this.intersects.length > 0) {

			if (this.intersect === null && this.intersects[0]) {
				this.intersect = this.intersects[0];
				this.onmouseover(this.intersect);
				return
			}

			if (this.intersect && this.intersect.object.name !== this.intersects[0].object.name) {
				this.onmouseout(this.intersect);
				this.intersect = this.intersects[0];
				this.onmouseover(this.intersect);
				return
			}

			if (this.intersect && this.intersect.object.name === this.intersects[0].object.name) {
				this.intersect = this.intersects[0];
				this.onmouseover(this.intersect);
				return
			}

		} else {
			if (this.intersect) {
				this.onmouseout(this.intersect);
				this.intersect = null;
			}
		}
	}



}