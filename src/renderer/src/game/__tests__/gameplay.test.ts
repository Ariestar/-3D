import { describe, it, expect } from 'vitest'
import { BLOCK_PROPERTIES } from '../store'
import { getSpeedMultiplier } from '../movementUtils'
import { subscribe, publish } from '../events'
import { chooseBiomeBlocks } from '../worldGen'

describe('硬度与采矿时间', () => {
  it('不同方块硬度存在且大于0', () => {
    Object.values(BLOCK_PROPERTIES).forEach(p => {
      expect(p.hardness).toBeGreaterThan(0)
    })
  })
  it('石头硬于泥土', () => {
    expect(BLOCK_PROPERTIES.stone.hardness).toBeGreaterThan(BLOCK_PROPERTIES.dirt.hardness)
  })
})

describe('移动速度倍数', () => {
  it('跑步加速与蹲伏减速', () => {
    expect(getSpeedMultiplier(true, false)).toBeGreaterThan(1)
    expect(getSpeedMultiplier(false, true)).toBeLessThan(1)
    expect(getSpeedMultiplier(false, false)).toBe(1)
  })
})

describe('生物群系选择', () => {
  it('雪原与沙漠区域映射正确', () => {
    const snow = chooseBiomeBlocks(0, -30)
    const sand = chooseBiomeBlocks(0, 30)
    expect(snow[0]).toBe('snow')
    expect(sand[0]).toBe('sand')
  })
})

describe('事件总线', () => {
  it('发布订阅正常工作', () => {
    let count = 0
    const unsub = subscribe('blockPlaced', () => { count += 1 })
    publish('blockPlaced', {})
    publish('blockPlaced', {})
    unsub()
    publish('blockPlaced', {})
    expect(count).toBe(2)
  })
})
