# Terraria 3D 🌍

A 3D voxel sandbox game inspired by Terraria, built with modern Web Technologies. This project explores the possibilities of building high-performance 3D games using Electron, React, and Three.js.

![Terraria 3D](https://placeholder-image-url-if-any.com)

## ✨ Features

- **Procedural Voxel World**: Infinite terrain generation using Simplex Noise with distinct layers (Grass, Dirt, Stone).
- **Mining & Building**: Fully destructible world. Mine blocks and place them anywhere.
- **Combat System**: 
  - Enemies (Slimes, Zombies) with simple AI.
  - Weapons (Sword with animation) and Tools (Pickaxe).
- **Survival Mechanics**:
  - Health System with heart UI.
  - Fall Damage logic.
- **Day/Night Cycle**: Dynamic lighting and sky changes.
- **Performance Optimized**: Uses `InstancedMesh` for rendering thousands of blocks efficiently.

## 🛠️ Tech Stack

- **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Physics**: Custom lightweight voxel physics engine.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ariestar/-3D.git
   cd Terraria3D
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run in development mode**
   ```bash
   pnpm run dev
   ```

4. **Build for production**
   ```bash
   pnpm run build
   ```

## 🎮 Controls

| Key | Action |
| --- | --- |
| **W, A, S, D** | Move |
| **Space** | Jump |
| **Mouse Move** | Look around |
| **Left Click** | Mine Block / Attack |
| **Right Click** | Place Block |
| **1 - 5** | Select Block Type |
| **Esc** | Unlock Cursor |

## 📦 Project Structure

```
src/
├── main/              # Electron Main Process
├── renderer/          # React Renderer Process
│   ├── src/
│   │   ├── game/      # Game Logic Components
│   │   │   ├── VoxelWorld.tsx  # World Generation & Rendering
│   │   │   ├── Player.tsx      # Physics & Movement
│   │   │   ├── Enemy.tsx       # Enemy AI
│   │   │   ├── Weapon.tsx      # Combat Logic
│   │   │   └── store.ts        # Game State (Zustand)
│   │   ├── App.tsx    # UI Overlay (Health, Hotbar)
│   │   └── main.tsx   # Entry Point
```

## 📄 License

MIT
