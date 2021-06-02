import { PlaneBufferGeometry, ShaderMaterial, Mesh, DoubleSide, BufferAttribute } from 'three';

import vertexShader_water from '../shaders/water/vertex.glsl';
import fragmentShader_water from '../shaders/water/fragment.glsl';

export default class WaterfallObject {
    constructor({ scene, uniforms }) {

        /** Experiment plane */
        const experimentPlaneGeometry = new PlaneBufferGeometry(3, 3, 30, 30);
        // const experimentPlaneMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00ffff) });
        const experimentPlaneMaterial = new ShaderMaterial({
            uniforms,
            vertexShader: vertexShader_water,
            fragmentShader: fragmentShader_water
        });
        //Иногда необходимо для отображения текстуры
        // experimentPlaneMaterial.needsUpdate = true;

        // Генерация шума для каждой вершины
        const displacement = new Float32Array(experimentPlaneGeometry.attributes.position.count);
        for (let i = 1; i < displacement.length; i++) {
            displacement[i] = Math.random() * 0.2;
        }
        // Установка шума неизменным атрибутом
        experimentPlaneGeometry.setAttribute('displacement', new BufferAttribute(displacement, 1));

        const waterfall = new Mesh(experimentPlaneGeometry, experimentPlaneMaterial)
        waterfall.position.setY(2);
        waterfall.castShadow = true;
        waterfall.receiveShadow = true;
        waterfall.material.side = DoubleSide;
        waterfall.name = 'waterfall'
        scene.add(waterfall);

        return { mesh: waterfall }
    }
}