import { VoxelWorld } from './VoxelWorld'
import { Player } from './Player'
import { Weapon } from './Weapon'
import { WorldEnvironment } from './WorldEnvironment'
import { EnemyManager } from './Enemy'
import { GuideNPC } from './NPCs'
import { AchievementsManager } from './achievements'

export const GameScene = () => {
  return (
    <>
      <WorldEnvironment />
      
      <Player />
      <Weapon />
      <VoxelWorld />
      <EnemyManager />
      <GuideNPC />
      <AchievementsManager />
    </>
  )
}
