import { useLayoutEffect, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import { useGameStore, BlockType, Block, getChunkKey, CHUNK_SIZE } from './store'
import { ThreeEvent } from '@react-three/fiber'

const colorMap: Record<BlockType, string> = {
  dirt: '#795548',
  grass: '#5ca904',
  stone: '#9e9e9e',
  wood: '#3e2723',
  leaf: '#2e7d32',
}

// Sub-component for a single chunk
const ChunkMesh = ({ blocks }: { chunkKey: string, blocks: Block[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  useLayoutEffect(() => {
    if (!meshRef.current) return
    
    const count = blocks.length
    if (count === 0) {
        meshRef.current.count = 0
        return
    }

    const tempObject = new THREE.Object3D()
    const tempColor = new THREE.Color()

    blocks.forEach((block, i) => {
      tempObject.position.set(block.position[0], block.position[1], block.position[2])
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
      
      tempColor.set(colorMap[block.type])
      meshRef.current.setColorAt(i, tempColor)
    })

    meshRef.current.count = count
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    
  }, [blocks])

  return (
    <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE]} 
        castShadow 
        receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  )
}

export const VoxelWorld = () => {
  const { chunks, setChunks, addBlock, removeBlock, selectedBlock } = useGameStore()
  
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
        
        // Surface
        addToChunk(x, surfaceY, z, 'grass')
        
        // Dirt Layer (3 blocks deep)
        for(let d=1; d<=3; d++) {
             addToChunk(x, surfaceY-d, z, 'dirt')
        }
        
        // Stone Layer (Deep)
        for(let d=4; d<=10; d++) {
             addToChunk(x, surfaceY-d, z, 'stone')
        }
      }
    }
    setChunks(newChunks)
  }, []) // Run once on mount

  // Raycasting Handler
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
      // Prevent event from bubbling to other chunks behind this one (if any)
      e.stopPropagation()

      if (e.button === 0) {
          // Left click: Break block
          // MOVED TO MINING COMPONENT (See Weapon/Mining logic)
          // To implement "mining time", we shouldn't break instantly on click.
          // We will handle this in a separate loop or component that tracks mouse down.
          
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
    <group onClick={handleClick}>
        {Object.entries(chunks).map(([key, blocks]) => (
            <ChunkMesh key={key} chunkKey={key} blocks={blocks} />
        ))}
    </group>
  )
}
