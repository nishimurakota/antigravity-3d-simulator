import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

const CELL_SIZE = 1;
const GRID_SIZE = 3;

export default function BoxGrid() {
  const { grid, phase, toolMode, placeBlock, orientation } = useStore();
  const groupRef = useRef<THREE.Group>(null);

  // Spacing increases during placement to allow selection of inner blocks
  const spacing = phase === 'placement' ? 1.5 : 1.0;

  // Smoothly animate rotation
  const targetQuaternion = new THREE.Quaternion(...orientation);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.slerp(targetQuaternion, 0.15);
    }
  });

  const cells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        cells.push({ x, y, z });
      }
    }
  }

  return (
    <group ref={groupRef}>
      {/* Outer bounding wireframe box - scales with spacing */}
      <mesh>
        <boxGeometry args={[3 * spacing, 3 * spacing, 3 * spacing]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges scale={1} threshold={15} color="#3b82f6" opacity={0.3} transparent />
      </mesh>

      {/* Render blocks and interactive zones */}
      {cells.map(({ x, y, z }) => {
        const key = `${x},${y},${z}`;
        const type = grid[key];
        const isBoundary = x === 0 || x === 2 || y === 0 || y === 2 || z === 0 || z === 2;

        return (
          <Cell
            key={key}
            x={x} y={y} z={z}
            type={type}
            isBoundary={isBoundary}
            phase={phase}
            toolMode={toolMode}
            spacing={spacing}
            onInteract={() => placeBlock(x, y, z)}
          />
        );
      })}
    </group>
  );
}

function Cell({ x, y, z, type, isBoundary, phase, toolMode, spacing, onInteract }: any) {
  const [hovered, setHovered] = useState(false);

  // Local position: expanded by spacing
  const posX = (x - 1) * CELL_SIZE * spacing;
  const posY = (y - 1) * CELL_SIZE * spacing;
  const posZ = (z - 1) * CELL_SIZE * spacing;

  const showHover = phase === 'placement' && hovered;
  const isBlackModeInvalid = toolMode === 'black' && !isBoundary;

  let color = '#ffffff';
  if (type === 'white') color = '#fdf8e7'; // yellowish ivory
  if (type === 'black') color = '#1e293b';

  return (
    <group position={[posX, posY, posZ]}>
      {/* Actual Block */}
      {type !== 'empty' && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={type === 'black' ? 0.4 : 0.1}
          />
          <Edges scale={1} threshold={15} color={type === 'white' ? '#475569' : '#000000'} />
        </mesh>
      )}

      {/* Interaction Box (Invisible raycast target) */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (phase === 'placement') onInteract();
        }}
      >
        {/* If empty, use a smaller hitbox to allow clicking between cells during selection */}
        <boxGeometry args={type === 'empty' ? [0.6, 0.6, 0.6] : [1, 1, 1]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
        {/* Cell Grid Lines to make the space visible */}
        <Edges scale={1} threshold={15} color="#475569" opacity={0.1} transparent />
      </mesh>

      {/* Hover Indicator - always 1x1 for clear feedback */}
      {showHover && (
        <mesh scale={0.96}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={
              toolMode === 'erase' ? '#ef4444' :
                (isBlackModeInvalid ? '#fbbf24' : '#3b82f6')
            }
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
