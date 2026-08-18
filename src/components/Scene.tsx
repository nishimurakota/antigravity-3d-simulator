import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useStore } from '../store';
import BoxGrid from './BoxGrid';

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraResetTrigger = useStore((state) => state.cameraResetTrigger);
  const prevTrigger = useRef(cameraResetTrigger);
  const isResetting = useRef(false);

  // Default front view position: directly facing the FRONT (+Z) side slightly elevated
  const targetPos = useMemo(() => new THREE.Vector3(0, 0.8, 7.5), []);
  const targetLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    if (cameraResetTrigger !== prevTrigger.current) {
      prevTrigger.current = cameraResetTrigger;
      isResetting.current = true;
    }
  }, [cameraResetTrigger]);

  useFrame(() => {
    if (isResetting.current) {
      camera.position.lerp(targetPos, 0.12);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, 0.12);
        controlsRef.current.update();
      }
      if (camera.position.distanceTo(targetPos) < 0.03) {
        camera.position.copy(targetPos);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLookAt);
          controlsRef.current.update();
        }
        isResetting.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={3}
      maxDistance={15}
      enablePan={false}
      onStart={() => {
        isResetting.current = false;
      }}
    />
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 7.5], fov: 45 }}
      shadows
    >
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-10, -10, -10]}
        intensity={0.4}
      />

      <BoxGrid />

      {/* Decorative shadows and environment */}
      <ContactShadows position={[0, -10, 0]} opacity={0} scale={15} blur={2} far={4} />

      <CameraController />
    </Canvas>
  );
}
