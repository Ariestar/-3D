// This script generates texture data URIs for all block types
// In a real app, these would be separate .png files
export const textureGenerators = {
  dirt: () => createNoiseTexture('#795548', '#5d4037', 1),
  grass: () => createGrassTexture(),
  stone: () => createNoiseTexture('#9e9e9e', '#757575', 2),
  wood: () => createWoodTexture(),
  leaf: () => createNoiseTexture('#2e7d32', '#1b5e20', 3),
  ebonstone: () => createNoiseTexture('#615286', '#453862', 2),
  crimstone: () => createNoiseTexture('#bd3333', '#9d1b1b', 2),
  crimtane: () => createOreTexture('#bd3333', '#ff0000'),
  demonite: () => createOreTexture('#453862', '#8000ff'),
  selection: () => createSelectionTexture(), // New texture for selection
}

function createCanvas(size = 128) { // Increased to 128 for better quality
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    return canvas
}

function createSelectionTexture() {
    const canvas = createCanvas()
    const ctx = canvas.getContext('2d')!
    
    // Transparent center
    ctx.clearRect(0, 0, 128, 128)
    
    // Thick white border
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, 124, 124)
    
    // Inner black outline for contrast
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(5, 5, 118, 118)
    ctx.strokeRect(1, 1, 126, 126)
    
    return canvas.toDataURL()
}

function createNoiseTexture(color1: string, color2: string, scale = 1) {
    const size = 128
    const canvas = createCanvas(size)
    const ctx = canvas.getContext('2d')!
    
    // Base color
    ctx.fillStyle = color1
    ctx.fillRect(0, 0, size, size)
    
    // Noise
    for (let i = 0; i < 400 * scale; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const s = Math.random() * 4 * scale
        ctx.fillStyle = color2
        ctx.globalAlpha = 0.3
        ctx.fillRect(x, y, s, s)
    }
    
    // Edge darkening for block definition
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, size, size)
    
    return canvas.toDataURL()
}

function createGrassTexture() {
    const size = 128
    const canvas = createCanvas(size)
    const ctx = canvas.getContext('2d')!
    
    // Dirt base
    ctx.fillStyle = '#795548'
    ctx.fillRect(0, 0, size, size)
    
    // Grass top
    ctx.fillStyle = '#5ca904'
    ctx.fillRect(0, 0, size, 40)
    
    // Grass drips
    for(let i=0; i<20; i++) {
        const x = Math.random() * size
        const h = Math.random() * 20 + 10
        ctx.fillRect(x, 40, 8, h)
    }
    
    // Noise on grass
    for(let i=0; i<100; i++) {
        ctx.fillStyle = '#3e7502'
        ctx.globalAlpha = 0.3
        ctx.fillRect(Math.random()*size, Math.random()*50, 4, 4)
    }
    
    return canvas.toDataURL()
}

function createWoodTexture() {
    const size = 128
    const canvas = createCanvas(size)
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = '#3e2723'
    ctx.fillRect(0, 0, size, size)
    
    // Planks
    ctx.strokeStyle = '#281a17'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, 32); ctx.lineTo(size, 32)
    ctx.moveTo(0, 64); ctx.lineTo(size, 64)
    ctx.moveTo(0, 96); ctx.lineTo(size, 96)
    ctx.stroke()
    
    // Wood grain noise
    for(let i=0; i<200; i++) {
        ctx.fillStyle = '#281a17'
        ctx.globalAlpha = 0.1
        ctx.fillRect(Math.random()*size, Math.random()*size, 2, 8)
    }
    
    return canvas.toDataURL()
}

function createOreTexture(rockColor: string, oreColor: string) {
    const size = 128
    const canvas = createCanvas(size)
    const ctx = canvas.getContext('2d')!
    
    // Rock Base
    ctx.fillStyle = rockColor
    ctx.fillRect(0, 0, size, size)
    
    // Noise on rock
    for (let i = 0; i < 400; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)'
        ctx.fillRect(Math.random()*size, Math.random()*size, 4, 4)
    }
    
    // Ore Spots
    for(let i=0; i<15; i++) {
        const x = Math.random() * (size - 20) + 10
        const y = Math.random() * (size - 20) + 10
        
        ctx.fillStyle = oreColor
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
        
        // Shine
        ctx.fillStyle = 'white'
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2)
        ctx.fill()
    }
    
    return canvas.toDataURL()
}
