import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import { useGameStore } from './store'
import * as THREE from 'three'
import { useRef } from 'react'

const DAY_LENGTH = 24000 // Ticks per day
const TICK_RATE = 2 // Slower time (approx 10x slower than before)

export const WorldEnvironment = () => {
  const { time, setTime } = useGameStore()
  const lightRef = useRef<THREE.DirectionalLight>(null!)
  const ambientRef = useRef<THREE.AmbientLight>(null!)

  useFrame(() => {
    // Advance time
    const newTime = (time + TICK_RATE) % DAY_LENGTH
    setTime(newTime)

    // Calculate sun position based on time
    // 0 = 6am, 6000 = noon, 12000 = 6pm, 18000 = midnight
    // We map 0-24000 to 0-2PI
    const angle = ((newTime / DAY_LENGTH) * Math.PI * 2) - (Math.PI / 2)
    
    // Orbit radius
    const radius = 100
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    
    if (lightRef.current) {
        lightRef.current.position.set(x, y, 20)
        
        // Intensity logic
        // Max intensity at noon (1.5), 0 at night
        const intensity = Math.max(0, Math.sin(angle)) * 1.5
        lightRef.current.intensity = intensity
    }

    if (ambientRef.current) {
        // Night ambient is 0.1, Day is 0.5
        const ambientIntensity = 0.1 + Math.max(0, Math.sin(angle)) * 0.4
        ambientRef.current.intensity = ambientIntensity
    }
  })

  // Calculate sun position for the Sky component
  const sunPos = new THREE.Vector3()
  if (lightRef.current) {
      sunPos.copy(lightRef.current.position)
  }

  return (
    <>
      <Sky sunPosition={sunPos} distance={450000} mieCoefficient={0.005} mieDirectionalG={0.7} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight ref={ambientRef} intensity={0.3} />
      <directionalLight 
        ref={lightRef}
        position={[20, 30, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      {/* Fog to hide chunk borders */}
      <fog attach="fog" args={['#87CEEB', 30, 80]} /> 
    </>
  )
}
