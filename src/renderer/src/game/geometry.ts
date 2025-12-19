import * as THREE from 'three'

export function createAtlasBoxGeometry() {
  const g = new THREE.BoxGeometry(1, 1, 1)
  const uv = g.attributes.uv as THREE.BufferAttribute
  const normals = g.attributes.normal as THREE.BufferAttribute
  const count = uv.count
  for (let vi = 0; vi < count; vi++) {
    const nx = normals.getX(vi)
    const ny = normals.getY(vi)
    const nz = normals.getZ(vi)
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    const nny = ny / len
    const v0 = nny > 0.9 ? 0.0 : (nny < -0.9 ? 2 / 3 : 1 / 3)
    const v1 = nny > 0.9 ? 1 / 3 : (nny < -0.9 ? 1.0 : 2 / 3)
    const u = uv.getX(vi)
    const v = uv.getY(vi)
    const mappedV = v0 + v * (v1 - v0)
    uv.setXY(vi, u, mappedV)
  }

  (uv as any).needsUpdate = true
  return g
}
