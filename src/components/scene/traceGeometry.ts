import * as THREE from 'three';

/** Polyline in board x/z -> 3D curve with rounded corners at height y. */
export function roundedPath(pts: [number, number][], y: number, radius = 0.14): THREE.CurvePath<THREE.Vector3> {
  const v = pts.map(([x, z]) => new THREE.Vector3(x, y, z));
  const path = new THREE.CurvePath<THREE.Vector3>();
  let cursor = v[0].clone();

  for (let i = 1; i < v.length; i++) {
    const p = v[i];
    if (i === v.length - 1) {
      path.add(new THREE.LineCurve3(cursor, p.clone()));
      break;
    }
    const prev = v[i - 1];
    const next = v[i + 1];
    const inLen = p.distanceTo(prev);
    const outLen = p.distanceTo(next);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const a = p.clone().add(prev.clone().sub(p).normalize().multiplyScalar(r));
    const b = p.clone().add(next.clone().sub(p).normalize().multiplyScalar(r));
    if (cursor.distanceTo(a) > 1e-4) path.add(new THREE.LineCurve3(cursor, a));
    path.add(new THREE.QuadraticBezierCurve3(a, p.clone(), b));
    cursor = b;
  }
  return path;
}

/** A flattened copper trace. Adds `aLen` (0..1 along the trace) for the pulse shader. */
export function traceGeometry(path: THREE.CurvePath<THREE.Vector3>, width = 0.034) {
  const length = path.getLength();
  const segments = Math.max(24, Math.round(length * 60));
  const geo = new THREE.TubeGeometry(path, segments, width, 10, false);
  // Squash vertically so the trace reads as a raised strip rather than a wire.
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const y0 = path.getPointAt(0).y;
  const aLen = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, y0 + (pos.getY(i) - y0) * 0.55);
    aLen[i] = uv.getX(i);
  }
  geo.setAttribute('aLen', new THREE.BufferAttribute(aLen, 1));
  geo.computeVertexNormals();
  return { geo, length };
}
