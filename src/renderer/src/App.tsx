import { Canvas } from '@react-three/fiber'
import { GameScene } from './game/GameScene'
import { Leva } from 'leva'
import { KeyboardControls } from '@react-three/drei'
import { useGameStore, BlockType } from './game/store'

import { useKeyboardControls } from '@react-three/drei'
import { useEffect } from 'react'

const HealthBar = () => {
    const { playerHealth, playerMaxHealth } = useGameStore()
    
    // Terraria style: Hearts. Each heart is 20 HP.
    // But for smoother display, let's just do a bar for now or hearts.
    // Let's do hearts using emojis for simplicity and style.
    const hearts = Math.ceil(playerHealth / 20)
    const maxHearts = Math.ceil(playerMaxHealth / 20)
    
    return (
        <div style={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            display: 'flex', 
            gap: 4,
            pointerEvents: 'none',
            userSelect: 'none'
        }}>
            {Array.from({ length: maxHearts }).map((_, i) => (
                <div key={i} style={{ fontSize: 24, filter: i < hearts ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
                    ❤️
                </div>
            ))}
            <div style={{ 
                position: 'absolute', 
                top: 30, 
                right: 0, 
                color: 'white', 
                fontSize: 14, 
                textShadow: '1px 1px 0 #000',
                width: '100%',
                textAlign: 'right'
            }}>
                {playerHealth}/{playerMaxHealth}
            </div>
        </div>
    )
}

const Hotbar = () => {
    const { selectedBlock, setSelectedBlock } = useGameStore()
    const [sub] = useKeyboardControls()
    const blocks: BlockType[] = ['dirt', 'grass', 'stone', 'wood', 'ebonstone', 'crimstone']
    
    useEffect(() => {
        return sub(
            (state) => state,
            (pressed) => {
                if (pressed.slot1) setSelectedBlock(blocks[0])
                if (pressed.slot2) setSelectedBlock(blocks[1])
                if (pressed.slot3) setSelectedBlock(blocks[2])
                if (pressed.slot4) setSelectedBlock(blocks[3])
                if (pressed.slot5) setSelectedBlock(blocks[4])
                // Add more slots if needed
            }
        )
    }, [sub, setSelectedBlock])

    return (
        <div className="hotbar">
            {blocks.map((b, i) => (
                <div 
                    key={b}
                    className={`slot ${selectedBlock === b ? 'active' : ''}`}
                    onClick={() => setSelectedBlock(b)}
                    style={{ backgroundColor: getColor(b) }}
                >
                    <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, color: 'white' }}>
                        {i + 1}
                    </span>
                </div>
            ))}
        </div>
    )
}

function getColor(type: BlockType) {
    switch(type) {
        case 'dirt': return '#795548';
        case 'grass': return '#5ca904';
        case 'stone': return '#9e9e9e';
        case 'wood': return '#3e2723';
        case 'leaf': return '#2e7d32';
        default: return '#fff';
    }
}

function App() {
  return (
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
          { name: 'slot1', keys: ['1'] },
          { name: 'slot2', keys: ['2'] },
          { name: 'slot3', keys: ['3'] },
          { name: 'slot4', keys: ['4'] },
          { name: 'slot5', keys: ['5'] },
        ]}
      >
        <GameUI />
        
        <Canvas shadows camera={{ fov: 60 }}>
          <GameScene />
        </Canvas>
        <Leva collapsed />
      </KeyboardControls>
  )
}

// Separate component to use KeyboardControls
const GameUI = () => {
    return (
        <>
            <div className="ui-overlay">
                <h1>Terraria 3D</h1>
                <p>WASD to Move, Space to Jump, Click to Lock Cursor</p>
                <p>Left Click: Break | Right Click: Place</p>
                <p>1-5: Select Block</p>
            </div>
            
            {/* Crosshair */}
            <div 
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    borderRadius: '50%',
                    opacity: 0.5,
                    zIndex: 20,
                    mixBlendMode: 'difference'
                }} 
            />

            <Hotbar />
            <HealthBar />
        </>
    )
}
export default App
