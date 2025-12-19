import { useLayoutEffect, useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import { useGameStore, BlockType, Block, getChunkKey } from './store'
import { ThreeEvent, useLoader } from '@react-three/fiber'
import { textureGenerators } from './textures'
import { createAtlasBoxGeometry } from './geometry'
import { configureAtlasTexture } from './textureUtils'

// Generate textures once
const textureData = {
    dirt: textureGenerators.dirt(),
    grass: textureGenerators.grass(),
    stone: textureGenerators.stone(),
    wood: textureGenerators.wood(),
    leaf: textureGenerators.leaf(),
    ebonstone: textureGenerators.ebonstone(),
    crimstone: textureGenerators.crimstone(),
    crimtane: textureGenerators.crimtane(),
    demonite: textureGenerators.demonite(),
}

// Map BlockType to Texture Index for Texture Atlas (simplified: using individual materials for now)
// Actually, InstancedMesh with multiple materials is hard.
// Better to use a Texture Atlas or Color mapping.
// Since we want "detailed textures", we should use a Texture Atlas or ArrayTexture.
// For simplicity in this prototype, let's just stick to InstancedMesh with COLOR for now,
// BUT apply a generic "noise" texture to everything to make it look detailed?
//
// WAIT! The user specifically asked for "more detailed textures".
// Creating a Texture Atlas on the fly is complex.
// Let's assume we use a simple approach: One InstancedMesh per BlockType?
// That allows each block type to have its own real texture.
// It's less efficient draw-call wise (9 draw calls instead of 1), but totally fine for < 100 block types.

const BlockMesh = ({ type, blocks }: { type: BlockType, blocks: Block[] }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const texture = useLoader(THREE.TextureLoader, textureData[type])
    configureAtlasTexture(texture)
    const geometry = useMemo(() => createAtlasBoxGeometry(), [])

    useLayoutEffect(() => {
        if (!meshRef.current) return
        
        const count = blocks.length
        
        // Reset matrix to zero scale for unused instances if we were reusing a larger buffer
        // But here we re-render on blocks change, so just setting count is mostly fine.
        // HOWEVER, if the 'blocks' array shrinks, React might not unmount/remount this component,
        // it just updates props. If 'count' decreases, we are fine.
        // If 'count' increases, we need to ensure the buffer is large enough.
        // We set args to 2000. If count > 2000, we have a problem (will not render).
        // If count < 2000, we set .count.
        
        // The artifacts (stretched polygons) usually happen when a matrix has NaNs or Infinite values,
        // OR when we render instances that haven't been initialized yet.
        
        // CRITICAL FIX: Explicitly zero out unused matrices or ensure we only render what we set.
        meshRef.current.count = count
        
        if (count === 0) return

        const tempObject = new THREE.Object3D()

        blocks.forEach((block, i) => {
            tempObject.position.set(block.position[0], block.position[1], block.position[2])
            tempObject.updateMatrix()
            meshRef.current.setMatrixAt(i, tempObject.matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
    }, [blocks])

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 2000]} geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial map={texture} roughness={0.8} />
        </instancedMesh>
    )
}

// Separate component for Selection Highlight to avoid re-rendering the whole world
const SelectionBox = ({ position }: { position: [number, number, number] | null }) => {
    const texture = useLoader(THREE.TextureLoader, textureGenerators.selection())
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter

    if (!position) return null

    return (
        <mesh position={[position[0] + 0.5, position[1] + 0.5, position[2] + 0.5]}>
            <boxGeometry args={[1.01, 1.01, 1.01]} />
            <meshBasicMaterial 
                map={texture}
                transparent 
                opacity={0.8}
                depthTest={false} // Always show on top
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

const ChunkGroup = ({ blocks }: { blocks: Block[] }) => {
    // Group blocks by type
    const blocksByType = useMemo(() => {
        const groups: Partial<Record<BlockType, Block[]>> = {}
        blocks.forEach(b => {
            if (!groups[b.type]) groups[b.type] = []
            groups[b.type]!.push(b)
        })
        return groups
    }, [blocks])

    return (
        <group>
            {(Object.keys(blocksByType) as BlockType[]).map(type => (
                <BlockMesh key={type} type={type} blocks={blocksByType[type]!} />
            ))}
        </group>
    )
}

export const VoxelWorld = () => {
  const { chunks, setChunks, addBlock, selectedBlock } = useGameStore()
  
  // Initial Generation
  useEffect(() => {
    // Only generate if empty
    if (Object.keys(chunks).length > 0) return

    const noise2D = createNoise2D();
    const size = 32 // Wider world
    const newChunks: Record<string, Block[]> = {}

    const addToChunk = (x: number, y: number, z: number, type: BlockType) => {
        const key = getChunkKey(x, y, z)
        if (!newChunks[key]) newChunks[key] = []
        newChunks[key].push({ id: `${x},${y},${z}`, position: [x, y, z], type })
    }

    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        // Terraria-like generation logic: Hills + Layers
        const surfaceY = Math.floor(noise2D(x * 0.05, z * 0.05) * 8)
        
        // Biome Logic (Simple region based)
        // x < -10 : Corruption
        // x > 10 : Crimson
        let surfaceBlock: BlockType = 'grass'
        let subBlock: BlockType = 'dirt'
        let stoneBlock: BlockType = 'stone'
        
        if (x < -15) {
            surfaceBlock = 'ebonstone'
            subBlock = 'ebonstone'
            stoneBlock = 'ebonstone'
        } else if (x > 15) {
            surfaceBlock = 'crimstone'
            subBlock = 'crimstone'
            stoneBlock = 'crimstone'
        }

        // Surface
        addToChunk(x, surfaceY, z, surfaceBlock)
        
        // Dirt Layer (3 blocks deep)
        for(let d=1; d<=3; d++) {
             addToChunk(x, surfaceY-d, z, subBlock)
        }
        
        // Stone Layer (Deep)
        for(let d=4; d<=10; d++) {
             addToChunk(x, surfaceY-d, z, stoneBlock)
             
             // Ore generation (Simple random)
             if (Math.random() < 0.05) {
                 if (stoneBlock === 'ebonstone') {
                     // Demonite
                     addToChunk(x, surfaceY-d, z, 'demonite')
                 } else if (stoneBlock === 'crimstone') {
                     // Crimtane
                     addToChunk(x, surfaceY-d, z, 'crimtane')
                 }
             }
        }
      }
    }
    setChunks(newChunks)
  }, []) // Run once on mount

  // Raycasting Handler (Selection Highlight)
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null)
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      
      if (e.type === 'pointermove') {
          // Update selection highlight
          if (e.face) {
              const normal = e.face.normal.clone()
              const point = e.point.clone()
              // Look slightly inside to find the block
              const blockPos = point.sub(normal.multiplyScalar(0.1)).floor()
              setHoverPos([blockPos.x, blockPos.y, blockPos.z])
          }
          return
      }
      
      // Mouse Leave
      if (e.type === 'pointerout') {
          setHoverPos(null)
          return
      }

      if (e.button === 0) {
          // Left click: Break block (handled by Weapon.tsx, but we can keep logic here if needed)
      } else if (e.button === 2) {
          // Right click: Place block
          if (!e.face) return;
          const normal = e.face.normal.clone()
          const point = e.point.clone()
          
          // Move slightly outside
          const placePos = point.add(normal.multiplyScalar(0.1)).floor()
          
          addBlock(placePos.x, placePos.y, placePos.z, selectedBlock)
      }
  }

  return (
    <group 
        onClick={handleClick} 
        onPointerMove={handleClick} 
        onPointerOut={handleClick}
    >
        {Object.entries(chunks).map(([key, blocks]) => (
            <ChunkGroup key={key} blocks={blocks} />
        ))}
        
        {/* Selection Highlight Box */}
        <SelectionBox position={hoverPos} />
    </group>
  )
}
