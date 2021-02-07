uniform sampler2D tExplosion;

varying vec2 vUv;
varying float noise;

void main() {
	vec4 t = texture2D(tExplosion, vec2(0.0, 1.0 - noise * 1.2));

  vec3 color;
	color.r = color.g = color.b =  1.0 * ( 1.0 - 2.0 * noise * 0.5 );
  gl_FragColor = t;
}