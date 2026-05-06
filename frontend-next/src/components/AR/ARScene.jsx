"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

const store = createXRStore({
  depthSensing: true,
  hand: true,
  domOverlay: typeof window !== 'undefined' ? { root: document.body } : undefined
});

const ARScene = ({ animationName = "Idle" }) => {
  return (
    <div className="w-full h-full relative" id="ar-container">
      <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <button
            onClick={() => store.enterAR()}
            className="pointer-events-auto px-10 py-5 bg-[#FFB300] text-[#0b1b2b] rounded-[30px] font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_rgba(255,179,0,0.3)] hover:scale-110 active:scale-95 transition-all border-4 border-white/20"
          >
            ✨ Activer la Magie AR
          </button>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 3], fov: 45 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            <ambientLight intensity={2.0} />
            <hemisphereLight intensity={1.5} groundColor="#000000" color="#ffffff" />
            <pointLight position={[5, 5, 5]} intensity={2} />
            <directionalLight position={[0, 10, 0]} intensity={1.5} />

            {/* Repère Debug : Un petit cube rouge pour confirmer que la 3D fonctionne */}
            <mesh position={[0, 0.5, -1.2]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
            </mesh>

            {/* Positionné à 1.2m devant l'utilisateur, à hauteur d'yeux (y=0) */}
            <Model 
              position={[0, -0.4, -1.2]} 
              scale={1.0} 
              animationName={animationName} 
            />

            <ContactShadows
              opacity={0.8}
              scale={15}
              blur={1}
              far={10}
              resolution={512}
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
