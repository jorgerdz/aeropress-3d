# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Running the Development Server
```bash
npm run dev
```

### Building the Project
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Development Guidelines

- Never run the dev env. I will do it

## Architecture Overview

This is a React + TypeScript + Vite application that creates a 3D dice rolling simulation for AeroPress coffee brewing parameters. The application uses:

- **React Three Fiber** (`@react-three/fiber`) for 3D rendering
- **React Three Drei** (`@react-three/drei`) for helper components
- **React Three Rapier** (`@react-three/rapier`) for physics simulation
- **Three.js** for 3D graphics

### Key Components

The application follows a component-based architecture:

1. **DiceScene** (`src/components/DiceScene.tsx`): Main scene component that orchestrates the entire dice rolling experience:
   - Physics world setup with walls and floor
   - Dice rolling logic and animation
   - Dice settling detection with velocity monitoring  
   - Face detection to determine which die face is "up" after settling
   - Gathering animation that arranges dice in a vertical column
   - Camera focusing animation to center view on dice column
   - Integration with 2D UI overlay system

2. **Die** (`src/components/Die.tsx`): Individual die component with:
   - Physics body using Rapier RigidBody
   - Six faces with brewing parameter text
   - Face content mapping for each die type (grind, ratio, method, agitation, temperature)

3. **DieFace** (`src/components/DieFace.tsx`): Renders text on each face of a die using Three.js Text

4. **BrewResults** (`src/components/BrewResults.tsx`): 2D UI overlay component that:
   - Displays brewing recipe based on dice results
   - Shows formatted instructions for each brewing parameter
   - Provides re-roll and share functionality
   - Implements smooth fade-in animation

5. **Type Definitions** (`src/components/types.ts`): Shared TypeScript interfaces

### Project Structure

- Mixed JavaScript/TypeScript setup (main entry is `.jsx`, components are `.tsx`)
- Vite configuration with TypeScript support
- ESLint configuration for code quality

## Application Flow

This project is based on the AeroPress dice which decide what kind of brew you make by random choice. Each die represents a different brewing factor, with each face having a different choice.

### User Experience Flow

1. **Initial State**: User sees a 3D scene with walls and floor
2. **Roll Trigger**: Click anywhere in the scene to roll dice
3. **Dice Physics**: Five dice drop from the sky with random velocities and rotations
4. **Settling Detection**: App monitors dice velocities to detect when they've stopped moving
5. **Face Detection**: Algorithm determines which face is "up" for each settled die
6. **Gathering Animation**: Dice smoothly move into a vertical column formation  
7. **Camera Focus**: Camera animates to focus on the dice column
8. **Results Display**: 2D overlay appears showing the complete brewing recipe
9. **User Actions**: Re-roll button or share functionality available

### Technical Implementation Details

- **Physics Engine**: Uses Rapier for realistic dice physics with proper collision detection
- **Face Detection**: Quaternion-based algorithm compares face normals to world-up vector
- **Animation System**: Multiple coordinated animations (gathering, camera focusing, UI transitions)
- **State Management**: React hooks manage complex state transitions between phases