"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { Model } from './AvatarModel';

const store = createXRStore({
  domOverlay: typeof window !== 'undefined' ? { root: document.body } : undefined
});

const ARScene = ({ animationName = "Idle" }) => {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <button
            onClick={() => store.enterAR()}
            className="pointer-events-auto px-12 py-6 bg-[#FFB300] text-[#0b1b2b] rounded-[40px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl border-4 border-white/20 animate-pulse"
          >
            🚀 LANCER LA MAGIE
          </button>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 50 }}>
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.0} />
            <pointLight position={[5, 5, 5]} intensity={5} />
            
            {/* CUBE DE TEST - Si vous voyez ça, la 3D marche ! */}
            <mesh position={[0, 0.2, -0.8]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshBasicMaterial color="red" />
            </mesh>

            <Model 
              position={[0, -0.4, -1.2]} 
              scale={1.0} 
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
