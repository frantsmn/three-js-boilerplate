import * as THREE from 'three';
import { loadGLTF, loadHDR } from '../modules/utils/loaders.js';

export default class BaseObject {
    constructor({ scene, renderer, manager }) {

        this.scene = scene;
        this.manager = manager;
        this.renderer = renderer;

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

        return { init: this.baseInit.bind(this) };
    }

    async baseInit() {
        let tree;

        await Promise.all([

            /** HDR */
            loadHDR('./static/hdr/studio_sm.hdr', this.renderer, this.scene, this.manager),

            /** Tree */
            new Promise((resolve) => {
                loadGLTF('./static/gltf/tree/model.gltf', this.manager)
                    .then((gltf) => {
                        tree = gltf;
                        resolve();
                    })
            })

        ]);

        tree.scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.position.x = -3;
            }
        });

        this.scene.add(tree.scene);

    }
}