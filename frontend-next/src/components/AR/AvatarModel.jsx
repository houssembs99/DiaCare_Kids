/* src/components/AR/AvatarModel.jsx */
"use client";

import React, { useEffect, useMemo } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

export function Model({ animationName = "greeting", ...props }) {
  const group = React.useRef()
  // Chargement du nouvel avatar
  const { scene, animations } = useGLTF('/models/boykidavatar.glb')
  
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    
    const availableActions = Object.keys(actions);
    let targetAction = actions[animationName];

    // Recherche par nom ou fuzzy match
    if (!targetAction) {
      const fuzzyMatch = availableActions.find(name => 
        name.toLowerCase().includes(animationName.toLowerCase())
      );
      if (fuzzyMatch) targetAction = actions[fuzzyMatch];
    }

    // Fallback sur happyidle si rien n'est trouvé
    if (!targetAction && actions['happyidle']) {
        targetAction = actions['happyidle'];
    }

    if (targetAction) {
      Object.values(actions).forEach(action => action?.fadeOut(0.5));
      targetAction.reset().fadeIn(0.5).play();
    }

    return () => {
      if (targetAction) targetAction.fadeOut(0.5);
    };
  }, [animationName, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clone} />
    </group>
  )
}

// Préchargement du nouveau modèle
useGLTF.preload('/models/boykidavatar.glb')
