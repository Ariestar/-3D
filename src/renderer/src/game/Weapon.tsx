import { useRef, useState, useEffect } from 'react'
import { useFrame, createPortal, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from './store'

export const Weapon = () => {
  const { camera } = useThree()
  const { enemies, updateEnemy, removeEnemy } = useGameStore()
  const meshRef = useRef<THREE.Group>(null!)
  const [isAttacking, setIsAttacking] = useState(false)
  
  // Animation state
  const swingProgress = useRef(0)
  
  // Hit cooldown to prevent multiple hits per swing
  const hasHit = useRef<Set<string>>(new Set())

  // Mining State
  const miningTime = useRef(0)
  const MINING_SPEED = 1.5 // Seconds to break a block
  const { removeBlock } = useGameStore()
  
  // Raycaster for mining
  const raycaster = useRef(new THREE.Raycaster())

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && !isAttacking) {
        setIsAttacking(true)
        swingProgress.current = 0
        hasHit.current.clear()
        miningTime.current = 0 // Start mining timer
      }
    }
    // We need continuous mining if button is held
    const handleMouseUp = () => {
        miningTime.current = 0
    }
    
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
        window.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isAttacking])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const dt = Math.min(delta, 0.1)

    // Mining Logic (Raycast from camera center)
    // Only mine if mouse is held (simulated by isAttacking for now, but ideally separate)
    // For now, let's say "Attacking" also counts as "Mining attempt"
    if (isAttacking) {
        miningTime.current += dt
        
        // Raycast every frame is expensive? Maybe every few frames.
        // But for prototype it's fine.
        if (miningTime.current > 0.2) { // Delay before mining starts (swing first)
            raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
            raycaster.current.far = 5 // Mining reach
            
            // We need access to the scene children to intersect with Voxel chunks
            // This is tricky in R3F as we don't have direct access to "all chunks" list easily 
            // without traversing scene.
            // A better way is to rely on the Physics engine or a global collider list.
            // OR: We just assume the VoxelWorld meshes are in the scene.
            const intersects = raycaster.current.intersectObjects(state.scene.children, true)
            
            // Filter for InstancedMesh (our chunks)
            const hit = intersects.find(i => i.object.type === 'InstancedMesh')
            
            if (hit && hit.face) {
                 // Visual feedback? (Particles)
                 
                 // Break block if timer reached
                 // Different blocks could have different hardness
                 if (miningTime.current >= 0.5) { // Fixed 0.5s for now
                     const normal = hit.face.normal.clone()
                     // Move slightly inside
                     const p = hit.point.clone().sub(normal.multiplyScalar(0.1)).floor()
                     removeBlock(p.x, p.y, p.z)
                     miningTime.current = 0 // Reset
                 }
            }
        }
    } else {
        miningTime.current = 0
    }
    
    // Idle bobbing
    const time = state.clock.getElapsedTime()
    
    if (isAttacking) {
        // Swing animation
        swingProgress.current += dt * 10 // Faster swing
        
        if (swingProgress.current >= Math.PI) {
            setIsAttacking(false)
            swingProgress.current = 0
        }
        
        // Arc motion
        const rotation = Math.sin(swingProgress.current) * 1.5
        meshRef.current.rotation.x = -rotation
        meshRef.current.rotation.z = -rotation * 0.5
        meshRef.current.position.z = -0.5 - Math.sin(swingProgress.current) * 0.5
        
        // Hit Detection (Only during the middle of the swing)
        if (swingProgress.current > 0.5 && swingProgress.current < 2.5) {
            const swordPos = new THREE.Vector3()
            meshRef.current.getWorldPosition(swordPos)
            // Actually, sword is attached to camera, so we should check relative to camera + forward offset
            
            // Simple approach: Check enemies within distance and angle in front of camera
            const attackRange = 2.5
            const attackAngle = Math.PI / 3 // 60 degrees cone
            
            enemies.forEach(enemy => {
                if (hasHit.current.has(enemy.id)) return
                
                const enemyPos = new THREE.Vector3(...enemy.position)
                const dist = enemyPos.distanceTo(camera.position)
                
                if (dist < attackRange) {
                    // Check angle
                    const dirToEnemy = enemyPos.clone().sub(camera.position).normalize()
                    const cameraDir = new THREE.Vector3()
                    camera.getWorldDirection(cameraDir)
                    
                    const angle = dirToEnemy.angleTo(cameraDir)
                    
                    if (angle < attackAngle) {
                        // HIT!
                        hasHit.current.add(enemy.id)
                        
                        // Apply Damage
                        const newHealth = enemy.health - 5
                        if (newHealth <= 0) {
                            removeEnemy(enemy.id)
                        } else {
                            // Knockback
                            const knockbackDir = dirToEnemy.multiplyScalar(10) // Strong impulse
                            knockbackDir.y = 5 // Pop up
                            
                            updateEnemy(enemy.id, { 
                                health: newHealth,
                                velocity: [knockbackDir.x, knockbackDir.y, knockbackDir.z]
                            })
                        }
                    }
                }
            })
        }
        
    } else {
        // Idle
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1)
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1)
        meshRef.current.position.y = -0.4 + Math.sin(time * 2) * 0.02
        meshRef.current.position.z = -0.5
    }
  })

  // Render the weapon as a child of the camera so it stays fixed on screen
  return createPortal(
    <group ref={meshRef} position={[0.4, -0.4, -0.5]}>
        {/* Sword Handle */}
        <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2]} />
            <meshStandardMaterial color="#5D4037" />
        </mesh>
        {/* Sword Guard */}
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.05, 0.2, 0.05]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Sword Blade */}
        <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.06, 0.6, 0.02]} />
            <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.1} />
        </mesh>
    </group>,
    camera
  )
}
