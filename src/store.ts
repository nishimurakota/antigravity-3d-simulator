import { create } from 'zustand';
import * as THREE from 'three';

export type BlockType = 'white' | 'black' | 'empty';
export type ToolMode = 'none' | 'white' | 'black' | 'erase';
export type Phase = 'placement' | 'rotation';

export interface BlockData {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

export interface SimulationState {
  grid: Record<string, BlockType>; // Key format: "x,y,z"
  phase: Phase;
  toolMode: ToolMode;

  // Rotation quaternion to represent box orientation
  orientation: [number, number, number, number]; // [x, y, z, w]

  history: { grid: Record<string, BlockType>; orientation: [number, number, number, number] }[];
  future: { grid: Record<string, BlockType>; orientation: [number, number, number, number] }[];

  // Actions
  setToolMode: (mode: ToolMode) => void;
  setPhase: (phase: Phase) => void;
  placeBlock: (x: number, y: number, z: number) => void;
  clearGrid: () => void;

  // Placeholder for the rotation and drop logic
  rotateBox: (axis: 'x' | 'y' | 'z', direction: 1 | -1) => void;

  undo: () => void;
  redo: () => void;
}

const initialGrid: Record<string, BlockType> = {};
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      initialGrid[`${x},${y},${z}`] = 'empty';
    }
  }
}

const copyGrid = (grid: Record<string, BlockType>) => ({ ...grid });

function simulateDrop(grid: Record<string, BlockType>, localGravity: THREE.Vector3): Record<string, BlockType> {
  let dropAxis: 'x' | 'y' | 'z' = 'y';
  let dropSign = -1;
  if (Math.abs(localGravity.x) > 0.5) { dropAxis = 'x'; dropSign = Math.sign(localGravity.x); }
  else if (Math.abs(localGravity.y) > 0.5) { dropAxis = 'y'; dropSign = Math.sign(localGravity.y); }
  else { dropAxis = 'z'; dropSign = Math.sign(localGravity.z); }

  const axes = ['x', 'y', 'z'] as const;
  const colAxes = axes.filter(a => a !== dropAxis);

  const newGrid: Record<string, BlockType> = { ...grid };
  for (const key in newGrid) {
    if (newGrid[key] === 'white') newGrid[key] = 'empty';
  }

  for (let c1 = 0; c1 < 3; c1++) {
    for (let c2 = 0; c2 < 3; c2++) {
      const start = dropSign === -1 ? 0 : 2;
      const step = dropSign === -1 ? 1 : -1;

      let writePos = start;

      for (let i = start; i >= 0 && i <= 2; i += step) {
        const coords: Record<string, number> = { [colAxes[0]]: c1, [colAxes[1]]: c2, [dropAxis]: i };
        const key = `${coords.x},${coords.y},${coords.z}`;
        const currentType = grid[key];

        if (currentType === 'black') {
          writePos = i + step;
        } else if (currentType === 'white') {
          const writeCoords: Record<string, number> = { [colAxes[0]]: c1, [colAxes[1]]: c2, [dropAxis]: writePos };
          const writeKey = `${writeCoords.x},${writeCoords.y},${writeCoords.z}`;
          newGrid[writeKey] = 'white';
          writePos += step;
        }
      }
    }
  }
  return newGrid;
}

export const useStore = create<SimulationState>((set, get) => ({
  grid: initialGrid,
  phase: 'placement',
  toolMode: 'none',
  orientation: [0, 0, 0, 1],
  history: [],
  future: [],

  setToolMode: (mode) => set({ toolMode: mode }),

  setPhase: (phase) => {
    if (phase === 'rotation') {
      // Transitioning to rotation clears future (no redo into different track)
      set({ phase, future: [] });
    } else {
      set({ phase });
    }
  },

  placeBlock: (x, y, z) => {
    const { phase, toolMode, grid } = get();
    if (phase !== 'placement') return;
    if (toolMode === 'none') return;

    const key = `${x},${y},${z}`;

    // Black blocks can only be placed on the outer boundary
    if (toolMode === 'black') {
      const isBoundary = x === 0 || x === 2 || y === 0 || y === 2 || z === 0 || z === 2;
      if (!isBoundary) return; // Cannot place black in the center (1,1,1)
    }

    const newType = toolMode === 'erase' ? 'empty' : toolMode;

    // Check if the current type is already the target type
    if (grid[key] === newType) return;

    // Note: Placing blocks doesn't record a full undo state per block in typical level editors
    // unless explicitly requested, but for now we won't flood the undo stack with individual placements.
    // Instead we'll push to history manually if we were to support granular placement undo.
    // For simplicity, we just mutate state here, and history tracks rotation states.

    set({
      grid: {
        ...grid,
        [key]: newType
      }
    });
  },

  clearGrid: () => set({ grid: initialGrid, history: [], future: [], orientation: [0, 0, 0, 1] }),

  rotateBox: (axis, direction) => {
    const { grid, orientation, history } = get();
    const currentQ = new THREE.Quaternion(...orientation);
    const axisVec = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    // World space rotation
    const rotQ = new THREE.Quaternion().setFromAxisAngle(axisVec, (direction * Math.PI) / 2);
    // Applying the world rotation requires premultiply since we want to rotate around global axes
    const newQ = currentQ.clone().premultiply(rotQ);

    // Compute local gravity: R^{-1} * G
    // G is world down (0, -1, 0)
    const invQ = newQ.clone().invert();
    const localGravity = new THREE.Vector3(0, -1, 0).applyQuaternion(invQ);

    const nextGrid = simulateDrop(grid, localGravity);

    set({
      history: [...history, { grid: copyGrid(grid), orientation }],
      future: [],
      grid: nextGrid,
      orientation: [newQ.x, newQ.y, newQ.z, newQ.w]
    });
  },

  undo: () => {
    const { history, future, grid, orientation } = get();
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    set({
      history: history.slice(0, -1),
      future: [{ grid: copyGrid(grid), orientation }, ...future],
      grid: copyGrid(previousState.grid),
      orientation: previousState.orientation
    });
  },

  redo: () => {
    const { history, future, grid, orientation } = get();
    if (future.length === 0) return;

    const nextState = future[0];
    set({
      history: [...history, { grid: copyGrid(grid), orientation }],
      future: future.slice(1),
      grid: copyGrid(nextState.grid),
      orientation: nextState.orientation
    });
  }
}));
