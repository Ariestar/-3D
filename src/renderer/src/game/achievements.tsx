import { useEffect, useRef } from 'react'
import { subscribe } from './events'

export const AchievementsManager = () => {
  const placed = useRef(0)
  const removed = useRef(0)
  useEffect(() => {
    const unsub1 = subscribe('blockPlaced', () => {
      placed.current += 1
    })
    const unsub2 = subscribe('blockRemoved', () => {
      removed.current += 1
    })
    return () => {
      unsub1()
      unsub2()
    }
  }, [])
  return null
}

