"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

export const store = createXRStore({
  domOverlay: { root: typeof document !== 'undefined' ? document.body : null },
});

const ARScene = ({ animationName = "Idle", modelScale = 1.3, modelRotation = 0 }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 45 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.5} />
            <pointLight position={[10, 10, 10]} intensity={4} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow />
            <directionalLight position={[-5, 5, 5]} intensity={2} />
            
            {/* Hamouch est placé ici */}
            <group rotation={[0, modelRotation, 0]} position={[0, -0.2, -1.2]}>
                <Model 
                  scale={modelScale} 
                  animationName={animationName} 
                />
                <ContactShadows opacity={0.8} scale={15} blur={1} far={10} resolution={512} color="#000000" />
            </group>
            
            <OrbitControls makeDefault target={[0, 0, 0]} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
