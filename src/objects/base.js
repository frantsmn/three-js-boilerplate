import {
    AmbientLight,
    DirectionalLight,
    PointLight,
    PlaneBufferGeometry,
    TextureLoader,
    RepeatWrapping,
    Mesh,
    MeshPhongMaterial
} from 'three';

import { loadGLTF, loadHDR } from '../modules/utils/async-loaders.js';

export default class BaseObject {
    constructor({ scene, renderer, manager }) {

        this.scene = scene;
        this.manager = manager;
        this.renderer = renderer;

        //#region Light
        scene.add(new AmbientLight(0xffffff, 0.1));

        const directionalLight = new DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(6, 8, -3);
        directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const pointLight = new PointLight(0xffffaa, 0.8);
        pointLight.position.set(0, 5, 0);
        pointLight.shadow.mapSize.width = pointLight.shadow.mapSize.height = 2048;
        pointLight.castShadow = true;
        scene.add(pointLight);
        //#endregion Light

        /** Plane */
        const planeGeometry = new PlaneBufferGeometry(30, 30);
        planeGeometry.rotateX(- Math.PI / 2);
        // const planeTexture = new THREE.TextureLoader().load('./static/textures/checkerboard.jpg');
        // planeTexture.repeat.x = planeTexture.repeat.y = 25;
        const planeTexture = new TextureLoader().load('./static/textures/uvgrid.jpg');
        planeTexture.wrapS = planeTexture.wrapT = RepeatWrapping;
        planeTexture.needsUpdate = true;
        const plane = new Mesh(planeGeometry, new MeshPhongMaterial({ color: 0xffffff, map: planeTexture }));
        plane.receiveShadow = true;
        plane.name = 'floor';
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