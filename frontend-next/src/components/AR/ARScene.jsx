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
            className="pointer-events-auto px-12 py-6 bg-[#FFB300] text-[#0b1b2b] rounded-[40px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl border-4 border-white/20 animate-pulse"
          >
            🌟 Lancer l'AR
          </button>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 50 }}>
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={2.5} />
            <pointLight position={[5, 5, 5]} intensity={3} />
            
            <Model 
              position={[0, -0.4, -1.2]} 
              scale={1.2} 
              animationName={animationName} 
            />

            <ContactShadows
              opacity={0.6}
              scale={10}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />
            
            <OrbitControls makeDefault />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
