"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

const ARScene = ({ store, animationName = "Idle", modelScale = 1.3, modelRotation = 0, isARMode = false, modelPositionOffset = { x: 0, z: 0 } }) => {
  if (!store) return null;

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 3) : 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance", // Demande le GPU dédié (pas l'intégré)
          precision: "highp",                  // Précision maximale des shaders
          alpha: true,                         // Fond transparent pour le mode AR
          preserveDrawingBuffer: false,        // Perf : désactive la sauvegarde du buffer
        }}
        shadows
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        className="bg-transparent"
      >
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.5} />
            <pointLight position={[10, 10, 10]} intensity={4} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
            <directionalLight position={[-5, 5, 5]} intensity={2} />
            {/* On utilise exactement la même position que Magie 3D pour l'AR pour garantir la même apparence */}
            <group rotation={[0, modelRotation + (isARMode ? 0 : 0), 0]} position={[0 + modelPositionOffset.x, -0.2, -1.2 + modelPositionOffset.z]}>
                <Model 
                  scale={modelScale} 
                  animationName={animationName} 
                />
                <ContactShadows opacity={0.6} scale={3} blur={2} far={10} resolution={2048} color="#000000" />
            </group>
            
            {/* Centrer la caméra sur le buste de l'avatar en mode Magie 3D (y=0.5, z=-1.2) */}
            {!isARMode && <OrbitControls makeDefault target={[0, 0.5, -1.2]} enablePan={false} maxDistance={10} />}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
