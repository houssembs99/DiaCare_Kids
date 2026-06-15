"use client";

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Model } from './AvatarModel';

/**
 * RendererConfig — Doit être INSIDE le Canvas pour accéder au contexte gl.
 *
 * Problèmes résolus ici :
 *
 * 1. COLOR SPACE : Les textures d'un GLB sont toujours en sRGB.
 *    Sans outputColorSpace = SRGBColorSpace, Three.js applique une double
 *    conversion qui rend les couleurs fausses/trop sombres/trop claires en XR.
 *
 * 2. TONE MAPPING : ACESFilmic donne un rendu cinématique identique en 3D et AR.
 *    Sans ça, le rendu AR utilise LinearToneMapping (très plat, couleurs fausses).
 *
 * 3. FRAMEBUFFER SCALE : Doit être appelé via gl.xr.setFramebufferScaleFactor()
 *    AVANT store.enterAR(). C'est l'API officielle Three.js WebXRManager.
 *    Le canvas DPR n'affecte PAS le framebuffer WebXR.
 *
 * 4. TEXTURE ANISOTROPY + COLOR SPACE : On traverse la scène et on force
 *    SRGBColorSpace + anisotropy max sur chaque texture de chaque material.
 */
function RendererConfig({ isARMode }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    if (!gl) return;

    // Fix 1 : Color space du renderer
    gl.outputColorSpace = THREE.SRGBColorSpace;

    // Fix 2 : Tone mapping identique 3D et AR
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;

    // Fix 3 : Framebuffer WebXR natif (API Three.js officielle)
    if (gl.xr && typeof gl.xr.setFramebufferScaleFactor === 'function') {
      const scale = typeof window !== 'undefined'
        ? Math.min(window.devicePixelRatio || 1, 2.5)
        : 2;
      gl.xr.setFramebufferScaleFactor(scale);
    }
  }, [gl]);

  // Fix 4 : Textures color space + anisotropy (appliqué après chaque chargement)
  useEffect(() => {
    if (!gl || !scene) return;
    const maxAnisotropy = gl.capabilities?.getMaxAnisotropy?.() ?? 4;

    const fixMaterials = () => {
      scene.traverse((node) => {
        if (!node.isMesh) return;

        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach((mat) => {
          if (!mat) return;

          // Double-sided : critique pour que le visage soit visible sous tous les angles AR
          mat.side = THREE.DoubleSide;

          const textureSlots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'];
          textureSlots.forEach((slot) => {
            const tex = mat[slot];
            if (!tex) return;

            // Force sRGB sur les textures couleur (map, emissiveMap)
            if (slot === 'map' || slot === 'emissiveMap') {
              tex.colorSpace = THREE.SRGBColorSpace;
            }

            // Anisotropie max pour éviter le flou en biais
            tex.anisotropy = maxAnisotropy;
            tex.needsUpdate = true;
          });

          mat.needsUpdate = true;
        });
      });
    };

    fixMaterials();
    // Second pass après 800ms (latence chargement GLB asynchrone)
    const t = setTimeout(fixMaterials, 800);
    return () => clearTimeout(t);
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
          powerPreference: 'high-performance',
          precision: 'highp',
          alpha: true,
          // CRITIQUE : false évite la double-multiplication alpha (WebXR compositor vs Three.js)
          // Avec true (défaut), les textures semi-transparentes (peau, visage) deviennent
          // opaques ou disparaissent complètement en mode AR.
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
        }}
        shadows
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        className="bg-transparent"
      >
        {/* Config renderer : doit être inside Canvas */}
        <RendererConfig isARMode={isARMode} />

        <XR store={store}>
          <Suspense fallback={null}>
            {/* Éclairage — intensités équilibrées pour AR (fond réel lumineux) */}
            <ambientLight intensity={isARMode ? 2.5 : 3.5} />
            <pointLight position={[10, 10, 10]} intensity={isARMode ? 2 : 4} />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={isARMode ? 1.5 : 3}
              castShadow={!isARMode}
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-5, 5, 5]} intensity={isARMode ? 1 : 2} />

            <group
              rotation={[0, modelRotation, 0]}
              position={[
                0 + modelPositionOffset.x,
                -0.2,
                -1.2 + modelPositionOffset.z
              ]}
            >
              <Model scale={modelScale} animationName={animationName} />
              {/* ContactShadows désactivé en AR : génère un render pass
                  supplémentaire qui corrompt le depth buffer WebXR */}
              {!isARMode && (
                <ContactShadows
                  opacity={0.6}
                  scale={3}
                  blur={2}
                  far={10}
                  resolution={2048}
                  color="#000000"
                />
              )}
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
