"use client";

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

// On crée le "store" XR pour gérer la session
const store = createXRStore();

const ARScene = ({ animationName = "Idle" }) => {
  return (
    <div className="w-full h-full relative">
      {/* Nouveau bouton compatible Version 6 */}
      <button
        onClick={() => store.enterAR()}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 bg-[#FFB300] text-[#0b1b2b] rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
      >
        Lancer l'AR
      </button>

      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        {/* On passe le store au composant XR */}
        <XR store={store}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />

            {/* Positionné à -2 sur l'axe Z pour être devant l'utilisateur au démarrage */}
            <Model 
              position={[0, 0, -2]} 
              scale={1.5} 
              animationName={animationName} 
            />

            <ContactShadows
              opacity={0.4}
              scale={10}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
          </Suspense>
        </XR>
      </Canvas>

      <div className="absolute top-6 left-6 text-white/40 text-[10px] font-black uppercase tracking-widest pointer-events-none">
        Mode : {animationName}
      </div>
    </div>
  );
};

export default ARScene;
