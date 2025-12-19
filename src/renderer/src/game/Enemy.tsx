import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore, Enemy } from './store'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

// Constants
const GRAVITY = 15
const SLIME_JUMP_FORCE = 6
const SLIME_MOVE_SPEED = 2
const AGGRO_RANGE = 20

// Reusing collision logic from Player (simplified)
const checkCollision = (x: number, y: number, z: number, getBlock: any) => {
    // Check center point
    if (getBlock(Math.floor(x), Math.floor(y), Math.floor(z))) return true
    if (getBlock(Math.floor(x), Math.floor(y + 0.5), Math.floor(z))) return true
    return false
}

const Slime = ({ data }: { data: Enemy }) => {
    const meshRef = useRef<THREE.Group>(null!)
    const { updateEnemy, getBlock } = useGameStore()
    const camera = useThree((state) => state.camera)
    
    // Local state for smooth interpolation
    // We sync back to store periodically or on major events
    const velocity = useRef(new THREE.Vector3(data.velocity[0], data.velocity[1], data.velocity[2]))
    const position = useRef(new THREE.Vector3(data.position[0], data.position[1], data.position[2]))
    
    const [isGrounded, setIsGrounded] = useState(false)
    const jumpTimer = useRef(Math.random() * 2) // Random start time

    useFrame((_state, delta) => {
        if (!meshRef.current) return
        
        const dt = Math.min(delta, 0.1)

        // 1. AI Logic
        jumpTimer.current -= dt
        
        const distToPlayer = position.current.distanceTo(camera.position)
        
        if (isGrounded && jumpTimer.current <= 0 && distToPlayer < AGGRO_RANGE) {
            // Jump towards player
            const direction = new THREE.Vector3()
                .subVectors(camera.position, position.current)
                .normalize()
            
            velocity.current.x = direction.x * SLIME_MOVE_SPEED
            velocity.current.z = direction.z * SLIME_MOVE_SPEED
            velocity.current.y = SLIME_JUMP_FORCE
            
            setIsGrounded(false)
            jumpTimer.current = 1 + Math.random() * 2 // Jump every 1-3 seconds
        }

        // 2. Physics Logic
        // Apply Gravity
        velocity.current.y -= GRAVITY * dt
        
        // Apply Velocity
        const moveX = velocity.current.x * dt
        const moveY = velocity.current.y * dt
        const moveZ = velocity.current.z * dt

        // Collision X
        if (!checkCollision(position.current.x + moveX, position.current.y, position.current.z, getBlock)) {
            position.current.x += moveX
        } else {
            velocity.current.x *= -0.5 // Bounce off walls
        }

        // Collision Z
        if (!checkCollision(position.current.x, position.current.y, position.current.z + moveZ, getBlock)) {
            position.current.z += moveZ
        } else {
            velocity.current.z *= -0.5
        }

        // Collision Y
        if (!checkCollision(position.current.x, position.current.y + moveY, position.current.z, getBlock)) {
            position.current.y += moveY
            setIsGrounded(false)
        } else {
            if (velocity.current.y < 0) {
                // Landed
                setIsGrounded(true)
                velocity.current.x = 0 // Stop sliding when landed
                velocity.current.z = 0
                // Snap to block top
                position.current.y = Math.floor(position.current.y) + 1.001
            }
            velocity.current.y = 0
        }

        // Update Mesh
        meshRef.current.position.copy(position.current)
        
        // Update Store (Throttled or just for syncing hitboxes)
        // For now, we update store position every frame for hit detection to work in Weapon
        updateEnemy(data.id, { 
            position: [position.current.x, position.current.y, position.current.z],
            velocity: [velocity.current.x, velocity.current.y, velocity.current.z]
        })
        
        // Squash and stretch animation
        const scaleY = isGrounded ? 1 : 1 + Math.min(0.5, Math.abs(velocity.current.y) * 0.1)
        const scaleXZ = isGrounded ? 1 : 1 - Math.min(0.2, Math.abs(velocity.current.y) * 0.05)
        meshRef.current.scale.set(scaleXZ, scaleY, scaleXZ)
    })

    return (
        <group ref={meshRef}>
            {/* Slime Body */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial 
                    color="#00FF00" 
                    transparent 
                    opacity={0.8} 
                    roughness={0.2}
                    metalness={0.1}
                />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.15, 0.5, 0.3]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color="black" />
            </mesh>
            <mesh position={[-0.15, 0.5, 0.3]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color="black" />
            </mesh>
            
            {/* Health Bar */}
            <Html position={[0, 1.2, 0]} center>
                <div style={{ 
                    background: 'red', 
                    width: '50px', 
                    height: '5px', 
                    border: '1px solid black' 
                }}>
                    <div style={{ 
                        background: '#00FF00', 
                        width: `${(data.health / 20) * 100}%`, 
                        height: '100%' 
                    }} />
                </div>
            </Html>
        </group>
    )
}

export const EnemyManager = () => {
    const { enemies, spawnEnemy } = useGameStore()
    
    // Debug spawner
    useFrame(({ clock }) => {
        // Spawn a slime every 10 seconds if less than 5 enemies
        if (Math.floor(clock.getElapsedTime()) % 10 === 0 && enemies.length < 5) {
             // Random pos around 0,0
             const x = (Math.random() - 0.5) * 20
             const z = (Math.random() - 0.5) * 20
             const y = 15 // Drop from sky
             
             // Check if we already spawned this second (hacky debounce)
             // Better to use a dedicated timer ref
             // For prototype, this might spawn multiple per second, let's just rely on array length check mostly
             spawnEnemy('slime', [x, y, z])
        }
    })
    
    // Initial spawn
    useState(() => {
        spawnEnemy('slime', [5, 10, 5])
        spawnEnemy('slime', [-5, 10, -5])
    })

    return (
        <group>
            {enemies.map(enemy => (
                <Slime key={enemy.id} data={enemy} />
            ))}
        </group>
    )
}
