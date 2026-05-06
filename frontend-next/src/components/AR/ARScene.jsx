"use client";

import React, { Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

const store = createXRStore({
  domOverlay: typeof window !== 'undefined' ? { root: document.body } : undefined
});

const InteractiveModel = ({ animationName }) => {
  const [rotation, setRotation] = useState([0, 0, 0]);

  return (
    <group 
      rotation={rotation}
      // On permet la rotation via OrbitControls qui est bridge par XR
    >
      <Model 
        position={[0, -0.5, -1.2]} 
        scale={1.2} 
        animationName={animationName} 
      />
    </group>
  );
};

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
            <Environment preset="sunset" />
            <ambientLight intensity={1.5} />
            <pointLight position={[5, 5, 5]} intensity={2} />
            <directionalLight position={[0, 10, 0]} intensity={1} castShadow />

            <InteractiveModel animationName={animationName} />

            <ContactShadows
              opacity={0.6}
              scale={10}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />

            <OrbitControls 
              makeDefault 
              enablePan={false} 
              minDistance={1} 
              maxDistance={5}
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
