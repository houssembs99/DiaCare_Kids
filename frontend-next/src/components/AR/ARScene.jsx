"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Text, Float, RoundedBox } from '@react-three/drei';
import { Model } from './AvatarModel';

const store = createXRStore({
  depthSensing: true,
  hand: true
});

const ARButton3D = ({ position, text, color, onClick, icon = "🚀" }) => (
  <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Fond du bouton en 3D */}
      <RoundedBox args={[0.5, 0.2, 0.05]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
      </RoundedBox>
      {/* Texte 3D */}
      <Text
        position={[0, 0, 0.04]}
        fontSize={0.05}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`${icon} ${text}`}
      </Text>
    </group>
  </Float>
);

const ARScene = ({ animationName = "Idle", onAction }) => {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <button
            onClick={() => store.enterAR()}
            className="pointer-events-auto px-12 py-6 bg-[#FFB300] text-[#0b1b2b] rounded-[40px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl border-4 border-white/20 animate-pulse"
          >
            🌟 LANCER LA MAGIE
          </button>
      </div>

      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 50 }}>
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={2.0} />
            <pointLight position={[5, 5, 5]} intensity={3} />
            <directionalLight position={[0, 10, 0]} intensity={1} />
            
            <Model 
              position={[0, -0.4, -1.2]} 
              scale={1.0} 
              animationName={animationName} 
            />

            {/* Bouton SPORT à gauche de Hamouch */}
            <ARButton3D 
                position={[-0.6, 0.3, -1.0]} 
                text="SPORT" 
                color="#FF9500" 
                icon="⚽"
                onClick={() => {
                    console.log("Action Sport détectée");
                    if (onAction) onAction('sport');
                }} 
            />

            {/* Bouton QUITTER à droite de Hamouch */}
            <ARButton3D 
                position={[0.6, 0.3, -1.0]} 
                text="QUITTER" 
                color="#FF3B30" 
                icon="↩️"
                onClick={() => window.location.href = '/kid/dashboard'} 
            />

            <OrbitControls makeDefault enablePan={false} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
