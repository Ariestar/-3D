import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { publish } from './events'

export type BlockType = 'dirt' | 'grass' | 'stone' | 'wood' | 'leaf' | 'ebonstone' | 'crimstone' | 'crimtane' | 'demonite' | 'sand' | 'snow'
export const BLOCK_PROPERTIES: Record<BlockType, { hardness: number }> = {
  dirt: { hardness: 0.5 },
  grass: { hardness: 0.6 },
  stone: { hardness: 2.0 },
  wood: { hardness: 1.2 },
  leaf: { hardness: 0.3 },
  ebonstone: { hardness: 3.5 },
  crimstone: { hardness: 3.5 },
  crimtane: { hardness: 2.5 },
  demonite: { hardness: 2.5 },
  sand: { hardness: 0.4 },
  snow: { hardness: 0.2 },
}

export interface Block {
  id: string
  position: [number, number, number]
  type: BlockType
}

export const CHUNK_SIZE = 16

export const getChunkKey = (x: number, y: number, z: number) => {
  const cx = Math.floor(x / CHUNK_SIZE)
  const cy = Math.floor(y / CHUNK_SIZE)
  const cz = Math.floor(z / CHUNK_SIZE)
  return `${cx},${cy},${cz}`
}

export interface Enemy {
  id: string
  type: 'slime' | 'zombie'
  position: [number, number, number]
  velocity: [number, number, number]
  health: number
}

interface GameState {
  chunks: Record<string, Block[]> // Key: "x,y,z" (chunk coords)
  selectedBlock: BlockType
  time: number // 0 - 24000
  enemies: Enemy[]
  playerHealth: number
  playerMaxHealth: number
  inventory: Record<BlockType, number>
  
  setPlayerHealth: (health: number) => void
  damagePlayer: (amount: number) => void
  
  setSelectedBlock: (type: BlockType) => void
  setTime: (time: number) => void
  setInventory: (inv: Record<BlockType, number>) => void
  decreaseItem: (type: BlockType, amount: number) => void
  spawnEnemy: (type: 'slime' | 'zombie', position: [number, number, number]) => void
  updateEnemy: (id: string, updates: Partial<Enemy>) => void
  removeEnemy: (id: string) => void
  
  addBlock: (x: number, y: number, z: number, type: BlockType) => void
  removeBlock: (x: number, y: number, z: number) => void
  getBlock: (x: number, y: number, z: number) => Block | undefined
  setChunks: (chunks: Record<string, Block[]>) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  chunks: {},
  selectedBlock: 'dirt',
  time: 6000, // Start at 6am
  enemies: [],
  playerHealth: 100,
  playerMaxHealth: 100,
  inventory: {
    dirt: 99, grass: 50, stone: 99, wood: 80, leaf: 40,
    ebonstone: 20, crimstone: 20, crimtane: 10, demonite: 10,
    sand: 60, snow: 60
  },
  
  setPlayerHealth: (health) => set({ playerHealth: health }),
  damagePlayer: (amount) => set((state) => ({ 
      playerHealth: Math.max(0, state.playerHealth - amount) 
  })),
  
  setSelectedBlock: (type) => set({ selectedBlock: type }),
  setTime: (time) => set({ time }),
  setInventory: (inv) => set({ inventory: inv }),
  decreaseItem: (type, amount) => set((state) => ({
    inventory: { ...state.inventory, [type]: Math.max(0, (state.inventory[type] || 0) - amount) }
  })),
  
  spawnEnemy: (type, position) => set((state) => ({
      enemies: [...state.enemies, { 
          id: nanoid(), 
          type, 
          position, 
          velocity: [0, 0, 0], 
          health: type === 'slime' ? 20 : 50 
      }]
  })),

  updateEnemy: (id, updates) => set((state) => ({
      enemies: state.enemies.map(e => e.id === id ? { ...e, ...updates } : e)
  })),

  removeEnemy: (id) => set((state) => ({
      enemies: state.enemies.filter(e => e.id !== id)
  })),

  addBlock: (x, y, z, type) => {
    const chunkKey = getChunkKey(x, y, z)
    set((state) => {
      const newChunks = { ...state.chunks }
      if (!newChunks[chunkKey]) newChunks[chunkKey] = []
      
      // Check if block exists
      const existingIdx = newChunks[chunkKey].findIndex(b => b.position[0] === x && b.position[1] === y && b.position[2] === z)
      
      const newBlock: Block = { id: nanoid(), position: [x, y, z], type }
      
      if (existingIdx !== -1) {
        // Replace
        newChunks[chunkKey] = [...newChunks[chunkKey]]
        newChunks[chunkKey][existingIdx] = newBlock
      } else {
        // Add
        newChunks[chunkKey] = [...newChunks[chunkKey], newBlock]
      }
      
      publish('blockPlaced', { x, y, z, type })
      return { chunks: newChunks }
    })
  },

  removeBlock: (x, y, z) => {
    const chunkKey = getChunkKey(x, y, z)
    set((state) => {
      const newChunks = { ...state.chunks }
      if (!newChunks[chunkKey]) return state

      newChunks[chunkKey] = newChunks[chunkKey].filter(b => 
        !(b.position[0] === x && b.position[1] === y && b.position[2] === z)
      )
      
      // Clean up empty chunks
      if (newChunks[chunkKey].length === 0) {
        delete newChunks[chunkKey]
      }
      
      publish('blockRemoved', { x, y, z })
      return { chunks: newChunks }
    })
  },

  getBlock: (x, y, z) => {
    const chunkKey = getChunkKey(x, y, z)
    const chunk = get().chunks[chunkKey]
    if (!chunk) return undefined
    return chunk.find(b => b.position[0] === x && b.position[1] === y && b.position[2] === z)
  },

  setChunks: (chunks) => set({ chunks }),
}))
