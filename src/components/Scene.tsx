import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import BoxGrid from './BoxGrid';

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [6, 6, 6], fov: 45 }}
      shadows
    >
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <BoxGrid />

      {/* Decorative shadows and environment */}
      <ContactShadows position={[0, -10, 0]} opacity={0} scale={15} blur={2} far={4} />

      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        enablePan={false}
      />
    </Canvas>
  );
}
