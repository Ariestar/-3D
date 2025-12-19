import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { useGameStore } from './store'
import { getSpeedMultiplier } from './movementUtils'

const SPEED = 5
const JUMP_FORCE = 6
const GRAVITY = 15
const PLAYER_HEIGHT = 1.8
const PLAYER_RADIUS = 0.3
const FALL_DAMAGE_THRESHOLD = 15
const FALL_DAMAGE_MULTIPLIER = 2

export const Player = () => {
  const { camera } = useThree()
  const [, get] = useKeyboardControls()
  const { getBlock, damagePlayer } = useGameStore()
  
  const velocity = useRef(new THREE.Vector3())
  const position = useRef(new THREE.Vector3(0, 10, 0))
  const inAir = useRef(true)

  useEffect(() => {
    // Initial position
    // If there is no world data yet, wait? 
    // Or just spawn high up.
    
    // We only set this ONCE on mount.
    camera.position.copy(position.current)
  }, [])

  useFrame((_state, delta) => {
    // 1. Cap delta time to prevent huge jumps if frame rate drops
    // (e.g. during initial load or tab switch)
    const dt = Math.min(delta, 0.1)

    const { forward, backward, left, right, jump, run, crouch } = get()
    
    // Movement direction
    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED * dt * getSpeedMultiplier(run, crouch))
      .applyEuler(camera.rotation)

    // Apply movement to temporary position
    const moveX = direction.x
    const moveZ = direction.z

    // Simple Gravity
    if (inAir.current) {
        velocity.current.y -= GRAVITY * dt
    } else if (jump) {
        velocity.current.y = JUMP_FORCE
        inAir.current = true
    } else {
        velocity.current.y = 0
    }

    // Apply Gravity
    const moveY = velocity.current.y * dt

    // Collision Detection (Very basic discrete collision detection)
    // Check X
    if (!checkCollision(position.current.x + moveX, position.current.y, position.current.z, getBlock)) {
        position.current.x += moveX
    } else {
        velocity.current.x = 0
    }

    // Check Z
    if (!checkCollision(position.current.x, position.current.y, position.current.z + moveZ, getBlock)) {
        position.current.z += moveZ
    } else {
        velocity.current.z = 0
    }

    // Check Y
    if (!checkCollision(position.current.x, position.current.y + moveY, position.current.z, getBlock)) {
        position.current.y += moveY
        // If we were falling and now we are not colliding, we are still in air
        // But if we were moving down and hit something, we landed.
    } else {
        // Collision on Y
        if (velocity.current.y < 0) {
            // Landed
            
            // Fall Damage
            // Velocity is negative when falling.
            // If velocity is less than -THRESHOLD (e.g. -20 < -15), apply damage.
            if (velocity.current.y < -FALL_DAMAGE_THRESHOLD) {
                const damage = Math.floor((Math.abs(velocity.current.y) - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_MULTIPLIER)
                if (damage > 0) {
                    damagePlayer(damage)
                    console.log("Fall damage:", damage)
                }
            }

            inAir.current = false
            velocity.current.y = 0
            // Snap to grid top?
            // Use Math.round to find the nearest block top, but be careful
            // We know we hit a block below us.
            // The block's top is at Math.floor(y) + 1 if we are inside it?
            // Let's rely on the fact that we hit *something*.
            
            // Simple snap:
            // If we are at y=5.5 and we hit y=5, we should be at 6.8 (if height is 1.8)
            // Wait, coordinate system:
            // Block at 0,0,0 occupies 0.0 to 1.0.
            // If player feet are at 1.0, head is at 2.8.
            
            // We want to snap feet to the top of the block below.
            // The block below is at Math.floor(position.current.y + moveY - PLAYER_HEIGHT)
            // So feet should be at that block's Y + 1.
            
            // However, since we are using a simplified collision check, let's just push out.
            // Better approach: Binary search or iterative step back?
            // Or just simplistic:
            // position.current.y = Math.ceil(position.current.y - PLAYER_HEIGHT) + PLAYER_HEIGHT + 0.001
            // The previous math was weird.
            
            // New Snap Logic:
            // Find the highest block Y in the collision box below feet
            const groundY = Math.floor(position.current.y - PLAYER_HEIGHT + moveY)
            position.current.y = groundY + 1 + PLAYER_HEIGHT + 0.001
            
        } else if (velocity.current.y > 0) {
            // Hit head
            velocity.current.y = 0
            // Push down?
            // position.current.y = Math.floor(position.current.y) - 0.001
        }
    }
    
    // Check if ground disappeared beneath
    // We check slightly below the feet
    if (!inAir.current) {
         // Feet level is position.y - PLAYER_HEIGHT
         // We check slightly below that level
         const feetY = position.current.y - PLAYER_HEIGHT
         if (!checkCollision(position.current.x, feetY - 0.1, position.current.z, getBlock)) {
             inAir.current = true
         }
    }

    // Update Camera
    camera.position.copy(position.current)
  })

  return <PointerLockControls />
}

function checkCollision(x: number, y: number, z: number, getBlock: any) {
    // Check bounding box corners
    // Player is a cylinder/box: height 1.8, radius 0.3
    // We check feet, center, head
    // Actually, checking a few points around the circumference is better.
    // For simplicity: Check center feet, center head, and maybe 4 corners at feet/head.
    
    // Simplified: Check point at feet and head.
    // NOTE: This is very rough. 
    // Ideally we iterate through all blocks that intersect the AABB.
    
    const minX = Math.floor(x - PLAYER_RADIUS)
    const maxX = Math.floor(x + PLAYER_RADIUS)
    const minY = Math.floor(y - PLAYER_HEIGHT)
    const maxY = Math.floor(y - 0.1) // Head level
    const minZ = Math.floor(z - PLAYER_RADIUS)
    const maxZ = Math.floor(z + PLAYER_RADIUS)

    for (let ix = minX; ix <= maxX; ix++) {
        for (let iy = minY; iy <= maxY; iy++) {
            for (let iz = minZ; iz <= maxZ; iz++) {
                if (getBlock(ix, iy, iz)) {
                    return true
                }
            }
        }
    }
    return false
}
