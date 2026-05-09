"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

const ARScene = ({ store, animationName = "Idle", modelScale = 1.3, modelRotation = 0, isARMode = false }) => {
  if (!store) return null;

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 45 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.5} />
            <pointLight position={[10, 10, 10]} intensity={4} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow />
            <directionalLight position={[-5, 5, 5]} intensity={2} />
            {/* En AR, on place le modèle sur le sol (y=0) et à 2.5m devant pour qu'il soit bien visible dans le cadre de la caméra */}
            <group rotation={[0, modelRotation, 0]} position={[0, isARMode ? 0 : -0.2, isARMode ? -2.5 : -1.2]}>
                <Model 
                  scale={modelScale} 
                  animationName={animationName} 
                />
                <ContactShadows opacity={0.8} scale={15} blur={1} far={10} resolution={512} color="#000000" />
            </group>
            
            {/* Désactiver OrbitControls en mode AR pour ne pas interférer avec le tracking du téléphone */}
            {!isARMode && <OrbitControls makeDefault target={[0, 0, 0]} enablePan={false} maxDistance={10} />}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
