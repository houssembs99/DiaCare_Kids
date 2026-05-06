"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { Model } from './AvatarModel';

export const store = createXRStore({
  domOverlay: typeof window !== 'undefined' ? { 
    root: () => document.getElementById('ar-ui-overlay') 
  } : undefined
});

const ARScene = ({ animationName = "Idle" }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 50 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={2.5} />
            <pointLight position={[5, 5, 5]} intensity={3} />
            <directionalLight position={[0, 10, 0]} intensity={1} />
            
            <Model 
              position={[0, -0.4, -1.2]} 
              scale={1.2} 
              animationName={animationName} 
            />

            <OrbitControls makeDefault enablePan={false} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
