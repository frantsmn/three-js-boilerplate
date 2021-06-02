import { TextureLoader, SpriteMaterial, Sprite } from 'three';

const spriteTexture = new TextureLoader().load('./static/textures/annotation-sprite.png');

class Annotation {
    constructor({ selector, position, showDirectionIcon, meshName, onClick, onRemove, renderer, scene, camera }) {
        this.element = document.querySelector(selector);
        this.directionIcon = this.element.querySelector('.annotation__direction-icon');
        this.showDirectionIcon = showDirectionIcon;
        this.position = position;
        this.onRemove = onRemove;

        this.canvas = renderer.domElement;
        this.scene = scene;
        this.camera = camera;

        this.createSpritePoint(position);

        scene.traverse((child) => {
            if (child.isMesh) {
                if (child.name === meshName) {
                    this.mesh = child;
                    // console.log(child.name);
                    // console.log('MESH', this.mesh, meshName, scene);
                }
            }
        });

        if (onClick && typeof onClick === 'function') {
            this.element.style.pointerEvents = 'all';
            this.element.style.cursor = 'pointer';

            this.element.addEventListener('click', (e) => onClick(e));
        }
    }

    update() {
        const vector = this.position.clone();
        vector.project(this.camera);
        vector.x = Math.round((0.5 + vector.x / 2) * (this.canvas.width / window.devicePixelRatio));
        vector.y = Math.round((0.5 - vector.y / 2) * (this.canvas.height / window.devicePixelRatio));

        this.element.style.left = `${vector.x}px`;
        this.element.style.top = `${vector.y}px`;
        const boundsBreak = this.checkBoundsBreak();

        if (boundsBreak.right) { // Annotation break right bound
            this.element.style.left = `${vector.x - this.element.offsetWidth}px`;
        }
        if (boundsBreak.bottom) { // Annotation break bottom bound
            this.element.style.top = `${vector.y - this.element.offsetHeight}px`;
        }

        const boundsOut = this.checkBoundsOut();
        if (boundsOut.right) {
            let y = vector.y;
            if (vector.y < 0) {
                y = 0;
            }
            // TODO Get rid of magic numbers (35)
            if (vector.y > this.canvas.offsetHeight - 35) {
                y = this.canvas.offsetHeight - 35;
            }
            this.directionIcon.style.left = 'unset';
            this.directionIcon.style.right = 0;
            this.directionIcon.style.top = `${y}px`;
            this.directionIcon.style.bottom = 'unset';
            this.directionIcon.classList.remove('show-direction-icon_left', 'show-direction-icon_top', 'show-direction-icon_bottom');
            this.directionIcon.classList.add('show-direction-icon_right');
        } else
            if (boundsOut.left) {
                let y = vector.y;
                if (vector.y < 0) {
                    y = 0;
                }
                // TODO Get rid of magic numbers (35)
                if (vector.y > this.canvas.offsetHeight - 35) {
                    y = this.canvas.offsetHeight - 35;
                }
                this.directionIcon.style.left = 0;
                this.directionIcon.style.right = 'unset';
                this.directionIcon.style.top = `${y}px`;
                this.directionIcon.style.bottom = 'unset';
                this.directionIcon.classList.remove('show-direction-icon_right', 'show-direction-icon_top', 'show-direction-icon_bottom');
                this.directionIcon.classList.add('show-direction-icon_left');
            } else
                if (boundsOut.top) {
                    let x = vector.x;
                    if (vector.x < 0) {
                        x = 0;
                    }
                    // TODO Get rid of magic numbers (35)
                    if (vector.x > this.canvas.offsetWidth - 35) {
                        x = this.canvas.offsetWidth - 35;
                    }
                    this.directionIcon.style.left = `${x}px`;
                    this.directionIcon.style.right = 'unset';
                    this.directionIcon.style.top = 0;
                    this.directionIcon.style.bottom = 'unset';
                    this.directionIcon.classList.remove('show-direction-icon_right', 'show-direction-icon_left', 'show-direction-icon_bottom');
                    this.directionIcon.classList.add('show-direction-icon_top');
                } else
                    if (boundsOut.bottom) {
                        let x = vector.x;
                        if (vector.x < 0) {
                            x = 0;
                        }
                        // TODO Get rid of magic numbers (35)
                        if (vector.x > this.canvas.offsetWidth - 35) {
                            x = this.canvas.offsetWidth - 35;
                        }
                        this.directionIcon.style.left = `${x}px`;
                        this.directionIcon.style.right = 'unset';
                        this.directionIcon.style.top = 'unset';
                        this.directionIcon.style.bottom = 0;
                        this.directionIcon.classList.remove('show-direction-icon_right', 'show-direction-icon_left', 'show-direction-icon_top');
                        this.directionIcon.classList.add('show-direction-icon_bottom');
                    } else {
                        this.directionIcon.classList.remove('show-direction-icon_right', 'show-direction-icon_left', 'show-direction-icon_top', 'show-direction-icon_bottom');
                    }


        if (this.checkOverlap()) {
            this.element.classList.add('overlapped');
        }
        else {
            this.element.classList.remove('overlapped');
        }
    }

    checkBoundsBreak() {
        const canvasRect = this.canvas.getBoundingClientRect();
        const annotationRect = this.element.getBoundingClientRect();

        const left = annotationRect.left <= canvasRect.left;
        const right = annotationRect.right >= canvasRect.right;
        const top = annotationRect.top <= canvasRect.top;
        const bottom = annotationRect.bottom >= canvasRect.bottom;

        return { left, right, top, bottom }
    }

    checkBoundsOut() {
        const canvasRect = this.canvas.getBoundingClientRect();
        const annotationRect = this.element.getBoundingClientRect();

        const left = annotationRect.left <= canvasRect.left - this.element.offsetWidth;
        const right = annotationRect.right >= canvasRect.right + this.element.offsetWidth;
        const top = annotationRect.top <= canvasRect.top - this.element.offsetHeight;
        const bottom = annotationRect.bottom >= canvasRect.bottom + this.element.offsetHeight;

        return { left, right, top, bottom }
    }

    checkOverlap() {
        if (!this.mesh) return false;
        const distanceToMesh = this.camera.position.distanceTo(this.mesh.position);
        const distanceToAnnotationPosition = this.camera.position.distanceTo(this.position);
        return distanceToAnnotationPosition > distanceToMesh;
    }

    createSpritePoint(position) {
        const spriteMaterial = new SpriteMaterial({
            map: spriteTexture,
            // alphaTest: 0.5,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            // color: 0xFFDD00,
            sizeAttenuation: false
        });

        const sprite = new Sprite(spriteMaterial);
        console.log(position);
        sprite.position.copy(position);
        console.log(sprite.position);
        sprite.scale.set(0.03, 0.03, 1);
        this.scene.add(sprite);
    }

    remove() { this.onRemove() }
}

export default class Annotations {
    constructor({ renderer, scene, camera }) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.annotations = [];

        // DEBUG
        window.annotations = this.annotations;
    }

    createAnnotation({ selector, position, showDirectionIcon, meshName, onClick, onRemove }) {
        if (!document.querySelector(selector)) return console.error(`[annotations.js] > Annotation has not been created! Can't find "${selector}"`);

        const onRemoveModified = () => {
            // Удалить из массива annotations
            const annotationIndex = this.annotations.findIndex(item => item === annotation);
            this.annotations.splice(annotationIndex, 1);
            // Выполнить переданную в конструктор функцию
            if (onRemove && typeof onRemove === 'function') onRemove(annotation);
        };
        const annotation = new Annotation({
            selector,
            position,
            showDirectionIcon,
            meshName,
            onClick,
            onRemove: onRemoveModified,
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera,
        });

        this.annotations.push(annotation);
        return annotation;
    }

    update() {
        for (let index = 0; index < this.annotations.length; index++) {
            this.annotations[index].update();
        }
    }
}


