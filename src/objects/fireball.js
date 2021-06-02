import { ShaderMaterial, Mesh, IcosahedronGeometry } from 'three';

import vertexShader_sphere from '../shaders/sphere/vertex.glsl';
import fragmentShader_sphere from '../shaders/sphere/fragment.glsl';

export default class FireballObject {
    constructor({ scene, uniforms }) {
        /** Experiment sphere */
        const experimentSphereMaterial = new ShaderMaterial({
            uniforms,
            vertexShader: vertexShader_sphere,
            fragmentShader: fragmentShader_sphere,
        });
        const fireball = new Mesh(
            new IcosahedronGeometry(2, 30),
            experimentSphereMaterial
        );
        scene.add(fireball);
        fireball.position.set(5, 2, 0);

        return { mesh: fireball }
    }
}