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
      <Canvas dpr={[1, 2]} gl={{ antialias: true }} shadows camera={{ position: [0, 1.5, 3], fov: 45 }} className="bg-transparent">
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.5} />
            <pointLight position={[10, 10, 10]} intensity={4} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
            <directionalLight position={[-5, 5, 5]} intensity={2} />
            {/* En AR avec 'local', (0,0,0) est la caméra. On le place 80cm plus bas (-0.8) et 2m devant (-2.0). On le tourne aussi vers l'enfant. */}
            <group rotation={[0, modelRotation + (isARMode ? 0 : 0), 0]} position={[0 + modelPositionOffset.x, isARMode ? -0.8 : -0.2, isARMode ? -2.0 + modelPositionOffset.z : -1.2 + modelPositionOffset.z]}>
                <Model 
                  scale={modelScale} 
                  animationName={animationName} 
                />
                <ContactShadows opacity={0.6} scale={3} blur={2} far={10} resolution={2048} color="#000000" />
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
