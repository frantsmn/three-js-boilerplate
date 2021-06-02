import { Vector3, Quaternion } from 'three';

// options

// {
//     animationDuration: 3000,
//     floorObject: Object
// }

export default class IndoorNavigation {
    constructor({ scene, camera, controls, TWEEN, options }) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls; this.controls.rotateSpeed *= -0.4;
        this.TWEEN = TWEEN;
        this.positionTween = new TWEEN.Tween();
        this.quanterionTween = new TWEEN.Tween();


        const floor = this.scene.getObjectByName("floor", true);
        let pointerDownPosition = {};


        floor.on('pointerdown', e => {
            pointerDownPosition = { ...e.data.global };
        });

        floor.on('pointerup', e => {
            const differenceX = Math.abs(e.data.global.x - pointerDownPosition.x);
            const differenceY = Math.abs(e.data.global.y - pointerDownPosition.y);
            if (differenceX > 0.005 || differenceY > 0.005) return;

            this.moveToPoint(e.intersects[0].point)
            this.rotateToPoint(e.intersects[0].point);
        });
    }

    // Передвижение камеры к точке
    // с соблюдением высоты по Y
    moveToPoint(point) {
        const { x, z } = point;
        this.positionTween.stop();
        this.positionTween = new this.TWEEN.Tween(this.camera.position)
            .to({ x, z }, 3000)
            .easing(this.TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => this.updateCameraOrbit())
            .start()
            .onStart(() => this.disableControls())
            .onComplete(() => this.enableControls())
    }

    // Поворот камеры к точке
    // с соблюдением высоты по Y
    rotateToPoint(point) {
        const START_QUATERNION = this.camera.quaternion.clone();
        const END_QUATERNION = this.getPositionalObjectQuaternion(this.camera, this.camera.position, point);
        const lerpQuaternion = progress => this.camera.quaternion.slerpQuaternions(START_QUATERNION, END_QUATERNION, progress);

        this.quanterionTween.stop();
        this.quanterionTween = new this.TWEEN.Tween({ progress: 0 })
            .to({ progress: 1 }, 3000)
            .easing(this.TWEEN.Easing.Cubic.InOut)
            .onUpdate(({ progress }) => {
                lerpQuaternion(progress);
                this.updateCameraOrbit();
            })
            .start()
            .onStart(() => this.disableControls())
            .onComplete(() => this.enableControls())
    }

    // Вычисление поворота камеры исходя из
    // позиции и цели (точки)
    getPositionalObjectQuaternion(object, position, target) {
        const originalObjectPosition = new Vector3().copy(object.position);
        const originalObjectQuaternion = new Quaternion().copy(object.quaternion)

        const positionalQuaternion = new Quaternion();

        // Нахождение кватерниона для объекта
        object.position.copy(position);

        // Cоблюдение высоты по Y (установить цель на высоту камеры)
        target.y = object.position.y;

        object.lookAt(target);
        positionalQuaternion.copy(object.quaternion);

        // Возврат объекта в начальное положение
        object.position.copy(originalObjectPosition);
        object.quaternion.copy(originalObjectQuaternion);
        return positionalQuaternion;
    }

    // Update OrbitControls target to a point just in front of the camera
    // Обновление положения и направления для OrbitControls при движении камеры
    updateCameraOrbit() {
        const forward = new Vector3();
        this.camera.getWorldDirection(forward);
        this.controls.target.copy(this.camera.position).add(forward);
    }

    disableControls() { this.controls.enableRotate = false }
    enableControls() { this.controls.enableRotate = true }

    //
    stopAllTransitionTweens() {
        this.quanterionTween.stop();
        this.positionTween.stop();
        this.enableControls();
    }
}