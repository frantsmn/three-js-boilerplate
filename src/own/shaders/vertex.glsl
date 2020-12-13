	uniform float time;
	uniform vec3 color;

	attribute float displacement;

	varying vec3 vNormal;
	varying vec2 vUv;

	float PI = 3.1415926;

	void main() {
		vNormal = normal;
		// vUv = uv;

		// Scale image
		/* move center point to top right corner */
		/* scale 60% */
		/* move center point to center */
		vUv = ((uv - 0.5) * 0.4);


		// Breathing move
		// vUv.y -= 0.03 * sin(time * 1.5);

		// Linear moving down
		vUv.y += 0.03 * (time * 1.5);
		
		vec3 pos = position;
		
		// Наложение шума из аттрибута
		// pos.x += 0.1 * sin(PI * 2.0 - time * 3.0 * displacement * 1.2);
		// pos.y += 0.1 * sin(time * 3.0 * displacement);
		pos.z += 0.2 * sin(time * 2.0 * displacement) * 0.3;

		// Изгиб типа "Парус"
		pos.z += sin(PI/2.0 - pos.x * 0.3); // Изгиб относительно оси X
		pos.z += sin(PI/2.0 - pos.y * 0.3); // Изгиб относительно оси Y
		pos.z -= 1.8;
		
		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
	}



// Basic vertex shader code

// varying vec2 vUv;

// void main() {

//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

// }