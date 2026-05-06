"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

const store = createXRStore({
  domOverlay: typeof window !== 'undefined' ? { root: document.body } : undefined
});

const ARScene = ({ animationName = "Idle" }) => {
  return (
    <div className="w-full h-full relative" id="ar-container">
      <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <button
            onClick={() => store.enterAR()}
            className="pointer-events-auto px-10 py-5 bg-[#FFB300] text-[#0b1b2b] rounded-[30px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl border-4 border-white/20"
          >
            🔥 DEMARRER AR
          </button>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 50 }}>
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.0} />
            <pointLight position={[0, 5, 0]} intensity={5} />
            
            {/* CUBE DE TEST - Tres proche (50cm) et tres brillant */}
            <mesh position={[0, 0, -0.5]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="red" />
            </mesh>

            <Model 
              position={[0, -0.2, -1.0]} 
              scale={0.8} 
              animationName={animationName} 
            />

            <OrbitControls makeDefault />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
