import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export const GuideNPC = () => {
  const meshRef = useRef<THREE.Group>(null!)
  const [showDialogue, setShowDialogue] = useState(false)
  const position = useRef(new THREE.Vector3(2, 10, 2)) // Spawn near origin
  
  // Basic AI: Look at player
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Look at player
    meshRef.current.lookAt(state.camera.position.x, meshRef.current.position.y, state.camera.position.z)
    
    // Simple bobbing
    meshRef.current.position.y = position.current.y + Math.sin(state.clock.getElapsedTime()) * 0.1
    
    // Dialogue trigger distance
    const dist = meshRef.current.position.distanceTo(state.camera.position)
    if (dist < 5) {
        // setShowDialogue(true) // Auto show? Maybe annoying.
    } else {
        setShowDialogue(false)
    }
  })

  return (
    <group 
        ref={meshRef} 
        position={[2, 10, 2]}
        onClick={(e) => {
            e.stopPropagation()
            setShowDialogue(!showDialogue)
        }}
    >
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
        <meshStandardMaterial color="#d4a373" /> {/* Skin tone */}
      </mesh>
      
      {/* Clothes (Shirt) */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.6]} />
        <meshStandardMaterial color="#555555" /> {/* Grey shirt */}
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.7, 0]}>
         <sphereGeometry args={[0.27, 8, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
         <meshStandardMaterial color="#4a3b2a" /> {/* Brown hair */}
      </mesh>

      {/* Name Tag */}
      <Html position={[0, 2.2, 0]} center>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', color: 'white', fontSize: '12px' }}>
            Guide
        </div>
      </Html>

      {/* Dialogue Box */}
      {showDialogue && (
        <Html position={[0, 2.8, 0]} center>
            <div style={{ 
                background: '#fff', 
                border: '2px solid #333', 
                padding: '10px', 
                borderRadius: '8px',
                width: '200px',
                pointerEvents: 'none',
                fontFamily: 'monospace'
            }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    "Greetings! I am here to give you advice on how to survive in this strange 3D world."
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                    *Tip: Press 1-5 to change blocks. Hold Click to mine.*
                </p>
            </div>
        </Html>
      )}
    </group>
  )
}
