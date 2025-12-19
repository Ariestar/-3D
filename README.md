# Terraria 3D 🌍

A high-performance 3D voxel sandbox game inspired by Terraria, built with modern Web Technologies. This project explores the possibilities of building complex 3D games using Electron, React, and Three.js.

![Terraria 3D Banner](https://placeholder-image-url-if-any.com)

## ✨ Features

- **Procedural Infinite World**: 
  - Generates infinite terrain using Simplex Noise.
  - Distinct biomes and layers (Grass, Dirt, Stone).
- **Voxel Interaction**: 
  - Fully destructible environment.
  - Place and mine blocks in real-time.
- **Dynamic Environment**:
  - **Day/Night Cycle**: Real-time sun movement with dynamic lighting and shadow casting.
  - **Atmosphere**: Volumetric fog, procedural sky, and starry nights.
- **Combat & Survival**:
  - **Enemies**: Fight against Slimes and Zombies with basic AI.
  - **Weapons**: use swords and tools with animations.
  - **Health System**: Classic heart-based health UI.
  - **Physics**: Fall damage, gravity, and collision detection.
- **Performance**: 
  - Optimized rendering using `InstancedMesh` for thousands of blocks.
  - Efficient chunk management.

## 🛠️ Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) (Desktop App wrapper)
- **Frontend Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Physics**: Custom lightweight voxel physics engine.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Terraria3D.git
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
   This will start the Vite dev server and launch the Electron window.

4. **Build for production**
   ```bash
   pnpm run build
   ```
   The output will be in the `dist` folder.

## 🎮 Controls

| Key | Action |
| --- | --- |
| **W, A, S, D** | Move Character |
| **Space** | Jump |
| **Shift** | Run / Sprint |
| **Ctrl** | Crouch |
| **Mouse Move** | Look Around |
| **Left Click** | Mine Block / Attack |
| **Right Click** | Place Block |
| **1 - 5** | Select Hotbar Slot |
| **Esc** | Unlock Cursor / Pause |

## 📚 Documentation

For more detailed information, check out the `docs/` folder:

- [**User Manual**](docs/USER_MANUAL.md): Detailed gameplay guide.
- [**Technical Guide**](docs/TECHNICAL.md): Architecture and system design.
- [**API Reference**](docs/API.md): Code documentation.

## 📦 Project Structure

```
Terraria3D/
├── dist-electron/     # Compiled Electron main process
├── docs/              # Documentation files
├── src/
│   ├── main/          # Electron Main Process (System interactions)
│   └── renderer/      # React Renderer Process (Game Logic)
│       ├── src/
│       │   ├── game/  # Core Game Components
│       │   │   ├── VoxelWorld.tsx   # Terrain generation
│       │   │   ├── Player.tsx       # Physics & Controls
│       │   │   ├── Enemy.tsx        # AI Logic
│       │   │   ├── WorldEnvironment.tsx # Day/Night Cycle
│       │   │   └── store.ts         # Game State (Zustand)
│       │   └── App.tsx              # UI Overlay & Canvas setup
└── package.json
```

## 📄 License

This project is licensed under the MIT License.
