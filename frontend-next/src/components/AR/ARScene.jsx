"use client";

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model } from './AvatarModel';

/**
 * XRQualitySetup – composant interne monté à l'intérieur du Canvas.
 *
 * Deux problèmes indépendants causent la pixelisation en WebXR :
 *
 * 1. FRAMEBUFFER SCALE :
 *    Le WebXRManager de Three.js utilise un framebufferScaleFactor de 1.0 par
 *    défaut, MAIS le navigateur mobile peut décider d'en utiliser un plus petit
 *    (ex: 0.5) pour économiser la batterie.
 *    → Fix : gl.xr.setFramebufferScaleFactor(devicePixelRatio) AVANT la session.
 *    C'est l'API officielle Three.js (r3f ne l'expose pas directement via props).
 *
 * 2. TEXTURE ANISOTROPY :
 *    En session WebXR, le filtre anisotropique des textures n'est PAS activé
 *    automatiquement. Sans lui, les textures semblent floues/pixelisées en biais.
 *    → Fix : parcourir la scène et appliquer getMaxAnisotropy() à chaque texture.
 */
function XRQualitySetup() {
  const { gl, scene } = useThree();

  useEffect(() => {
    if (!gl) return;

    // ── Fix 1 : Framebuffer scale natif du device ─────────────────────────────
    // Doit être appelé AVANT store.enterAR() pour prendre effet.
    // On clamp à 2.5 pour éviter les crashes GPU sur les devices low-end.
    if (gl.xr && typeof gl.xr.setFramebufferScaleFactor === 'function') {
      const targetScale = typeof window !== 'undefined'
        ? Math.min(window.devicePixelRatio || 1, 2.5)
        : 2;
      gl.xr.setFramebufferScaleFactor(targetScale);
    }

    // ── Fix 2 : Anisotropie max sur toutes les textures ───────────────────────
    // Sans ça, les textures paraissent floues quand vues en biais (mode AR/3D).
    const maxAnisotropy = gl.capabilities?.getMaxAnisotropy?.() ?? 4;

    const applyAnisotropy = () => {
      scene.traverse((node) => {
        if (!node.isMesh) return;
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach((mat) => {
          if (!mat) return;
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach((slot) => {
            if (mat[slot]) {
              mat[slot].anisotropy = maxAnisotropy;
              mat[slot].needsUpdate = true;
            }
          });
        });
      });
    };

    // Appliquer maintenant + après 500ms (le modèle GLB peut ne pas être encore chargé)
    applyAnisotropy();
    const timer = setTimeout(applyAnisotropy, 500);
    return () => clearTimeout(timer);
  }, [gl, scene]);

  return null;
}

const ARScene = ({
  store,
  animationName = "Idle",
  modelScale = 1.3,
  modelRotation = 0,
  isARMode = false,
  modelPositionOffset = { x: 0, z: 0 }
}) => {
  if (!store) return null;

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 3) : 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          precision: "highp",
          alpha: true,
          preserveDrawingBuffer: false,
        }}
        shadows
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        className="bg-transparent"
      >
        {/* Fix qualité AR : doit être à l'intérieur du Canvas pour accéder à gl */}
        <XRQualitySetup />

        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={3.5} />
            <pointLight position={[10, 10, 10]} intensity={4} />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={3}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-5, 5, 5]} intensity={2} />

            <group
              rotation={[0, modelRotation, 0]}
              position={[0 + modelPositionOffset.x, -0.2, -1.2 + modelPositionOffset.z]}
            >
              <Model scale={modelScale} animationName={animationName} />
              <ContactShadows
                opacity={0.6}
                scale={3}
                blur={2}
                far={10}
                resolution={2048}
                color="#000000"
              />
            </group>

            {!isARMode && (
              <OrbitControls
                makeDefault
                target={[0, 0.5, -1.2]}
                enablePan={false}
                maxDistance={10}
              />
            )}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScene;
