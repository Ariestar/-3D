import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createAtlasBoxGeometry } from '../geometry'
import { configureAtlasTexture } from '../textureUtils'

describe('UV atlas mapping', () => {
  it('maps top/side/bottom vertices to correct V ranges', () => {
    const g = createAtlasBoxGeometry()
    const uv = g.attributes.uv as THREE.BufferAttribute
    const normals = g.attributes.normal as THREE.BufferAttribute
    const count = uv.count
    for (let vi = 0; vi < count; vi++) {
      const ny = normals.getY(vi)
      const len = Math.sqrt(
        normals.getX(vi) ** 2 + normals.getY(vi) ** 2 + normals.getZ(vi) ** 2
      ) || 1
      const nny = ny / len
      const v = uv.getY(vi)
      if (nny > 0.9) {
        expect(v).toBeGreaterThanOrEqual(0.0)
        expect(v).toBeLessThanOrEqual(1 / 3 + 1e-6)
      } else if (nny < -0.9) {
        expect(v).toBeGreaterThanOrEqual(2 / 3 - 1e-6)
        expect(v).toBeLessThanOrEqual(1.0)
      } else {
        expect(v).toBeGreaterThanOrEqual(1 / 3 - 1e-6)
        expect(v).toBeLessThanOrEqual(2 / 3 + 1e-6)
      }
    }
  })
})

describe('Texture sampling configuration', () => {
  it('configures texture for atlas correctly', () => {
    const tex = new THREE.Texture()
    configureAtlasTexture(tex)
    expect(tex.magFilter).toBe(THREE.NearestFilter)
    expect(tex.minFilter).toBe(THREE.NearestFilter)
    expect(tex.wrapS).toBe(THREE.ClampToEdgeWrapping)
    expect(tex.wrapT).toBe(THREE.ClampToEdgeWrapping)
    expect(tex.generateMipmaps).toBe(false)
  })
})
