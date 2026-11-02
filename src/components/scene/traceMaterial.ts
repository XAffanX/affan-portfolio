import * as THREE from 'three';

export interface PulseUniforms {
  uTime: { value: number };
  uSpeed: { value: number };   // cycles per second along this trace
  uOffset: { value: number };
  uActive: { value: number };  // 0 idle .. 1 highlighted
  uBurst: { value: number };   // short flash after a click
  uPulse: { value: THREE.Color };
  uGlow: { value: THREE.Color };
}

/**
 * Copper material with a travelling signal pulse. The pulse is a short bright head
 * with an exponential tail, computed from the per-vertex position along the trace.
 */
export function createTraceMaterial(speed: number, offset: number) {
  const uniforms: PulseUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uOffset: { value: offset },
    uActive: { value: 0 },
    uBurst: { value: 0 },
    uPulse: { value: new THREE.Color('#b9f0d8') },
    uGlow: { value: new THREE.Color('#f0a46a') },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: '#c27f4e',
    roughness: 0.38,
    metalness: 0.75,
  });

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      'attribute float aLen;\nvarying float vLen;\n' +
      shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vLen = aLen;');
    shader.fragmentShader =
      `varying float vLen;
uniform float uTime; uniform float uSpeed; uniform float uOffset;
uniform float uActive; uniform float uBurst;
uniform vec3 uPulse; uniform vec3 uGlow;
` +
      shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
  float head = fract(uTime * uSpeed * (1.0 + uActive * 0.8) + uOffset);
  float behind = fract(head - vLen);            // distance behind the pulse head
  float tail = exp(-behind * mix(26.0, 14.0, uActive));
  float front = smoothstep(0.0, 0.004, behind);  // crisp leading edge
  float pulse = tail * front;
  float strength = mix(0.55, 2.4, uActive) + uBurst * 2.5;
  totalEmissiveRadiance += uPulse * pulse * strength;
  totalEmissiveRadiance += uGlow * (uActive * 0.22 + uBurst * 0.35);`
      );
  };
  mat.customProgramCacheKey = () => 'trace-pulse-v1';

  return { mat, uniforms };
}
