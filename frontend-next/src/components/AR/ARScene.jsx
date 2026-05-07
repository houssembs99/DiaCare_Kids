"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

export const store = createXRStore({
  domOverlay: typeof window !== 'undefined' ? { root: document.body } : undefined
});

const ARScene = ({ animationName = "Idle", modelScale = 1.3, modelRotation = 0 }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 1, 3], fov: 45 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={2.5} />
            <pointLight position={[5, 5, 5]} intensity={3} />
            <directionalLight position={[0, 10, 0]} intensity={1} />
            
            <group rotation={[0, modelRotation, 0]}>
                <Model 
                position={[0, -0.8, -1.5]} 
                scale={modelScale} 
                animationName={animationName} 
                />
                <ContactShadows opacity={0.5} scale={10} blur={2} far={10} resolution={256} color="#000000" />
            </group>

            <OrbitControls 
              makeDefault 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true} 
              target={[0, 0.5, 0]} 
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
