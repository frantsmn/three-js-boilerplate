	uniform float time;
	uniform vec3 color;
	uniform sampler2D tWater;

	// attribute float displacement;

	varying vec3 vNormal;
	varying vec2 vUv;

	float PI = 3.1415926;

	void main() {
		vec4 t = texture2D(tWater, vUv);

		gl_FragColor = t;
		//gl_FragColor = t * vec4(color.r, color.g * .5, color.b * .5, 1.0);
	}