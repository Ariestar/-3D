# 架构与模块

## 场景与渲染
- 体素世界：`src/renderer/src/game/VoxelWorld.tsx`
- 几何与贴图：`src/renderer/src/game/geometry.ts`、`textureUtils.ts`、`textures.ts`
- 环境：`src/renderer/src/game/WorldEnvironment.tsx`

## 玩法与系统
- 玩家控制与物理：`src/renderer/src/game/Player.tsx`
- 交互与采矿：`src/renderer/src/game/Weapon.tsx`
- 敌人与AI：`src/renderer/src/game/Enemy.tsx`
- 状态管理：`src/renderer/src/game/store.ts`
- 生物群系选择：`src/renderer/src/game/worldGen.ts`
- 事件与成就：`src/renderer/src/game/events.ts`、`achievements.tsx`

## 测试
- UV与纹理：`src/renderer/src/game/__tests__/uvAtlas.test.ts`
- 玩法与系统：`src/renderer/src/game/__tests__/gameplay.test.ts`

