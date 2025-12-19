import { BlockType } from './store'
export const chooseBiomeBlocks = (x: number, z: number): [BlockType, BlockType, BlockType] => {
  let surfaceBlock: BlockType = 'grass'
  let subBlock: BlockType = 'dirt'
  let stoneBlock: BlockType = 'stone'
  if (z < -20) {
    surfaceBlock = 'snow'
    subBlock = 'snow'
    stoneBlock = 'stone'
  } else if (z > 20) {
    surfaceBlock = 'sand'
    subBlock = 'sand'
    stoneBlock = 'stone'
  } else if (x < -15) {
    surfaceBlock = 'ebonstone'
    subBlock = 'ebonstone'
    stoneBlock = 'ebonstone'
  } else if (x > 15) {
    surfaceBlock = 'crimstone'
    subBlock = 'crimstone'
    stoneBlock = 'crimstone'
  }
  return [surfaceBlock, subBlock, stoneBlock]
}
