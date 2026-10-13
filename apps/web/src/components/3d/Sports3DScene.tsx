'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { BadmintonCourt } from './BadmintonCourt';
import { PickleballCourt } from './PickleballCourt';
import { BadmintonRacket } from './BadmintonRacket';
import { PickleballPaddle } from './PickleballPaddle';
import { AnimeCharacter } from './AnimeCharacter';
import { useSportsTimeline, SportsSceneRefs } from './useSportsTimeline';

export interface Sports3DSceneProps {
  isAuthenticated: boolean;
}

export function Sports3DScene({ isAuthenticated }: Sports3DSceneProps) {
  const badmintonCourtRef = useRef<THREE.Group>(null);
  const pickleballCourtRef = useRef<THREE.Group>(null);
  const crossXGroupRef = useRef<THREE.Group>(null);
  const crossBadmintonRef = useRef<THREE.Group>(null);
  const crossPickleballRef = useRef<THREE.Group>(null);
  const dualRacketsGroupRef = useRef<THREE.Group>(null);
  const dualBadmintonRef = useRef<THREE.Group>(null);
  const dualPickleballRef = useRef<THREE.Group>(null);
  const animeCharacterRef = useRef<THREE.Group>(null);
  const animeHeadRef = useRef<THREE.Group>(null);
  const animeMouthNeutralRef = useRef<THREE.Group>(null);
  const animeMouthSmileRef = useRef<THREE.Group>(null);
  const animeBlushRef = useRef<THREE.Group>(null);

  const refs: SportsSceneRefs = useMemo(
    () => ({
      badmintonCourtRef,
      pickleballCourtRef,
      crossXGroupRef,
      crossBadmintonRef,
      crossPickleballRef,
      dualRacketsGroupRef,
      dualBadmintonRef,
      dualPickleballRef,
      animeCharacterRef,
      animeHeadRef,
      animeMouthNeutralRef,
      animeMouthSmileRef,
      animeBlushRef,
    }),
    [],
  );

  useSportsTimeline(refs, isAuthenticated);

  return (
    <>
      {/* 1. SÂN CẦU LÔNG */}
      <BadmintonCourt courtRef={badmintonCourtRef} />

      {/* 2. SÂN PICKLEBALL */}
      <PickleballCourt courtRef={pickleballCourtRef} />

      {/* 3. CẶP VỢT CHỮ X (Intro) */}
      <group ref={crossXGroupRef} visible={false}>
        <BadmintonRacket racketRef={crossBadmintonRef} />
        <PickleballPaddle
          paddleRef={crossPickleballRef}
          scale={[1.22, 1.22, 1.22]}
        />
      </group>

      {/* 4. CẶP VỢT DUAL RACKETS (Feature 03) */}
      <group ref={dualRacketsGroupRef} visible={false}>
        <BadmintonRacket racketRef={dualBadmintonRef} />
        <PickleballPaddle
          paddleRef={dualPickleballRef}
          scale={[1.22, 1.22, 1.22]}
        />
      </group>

      {/* 5. NHÂN VẬT ANIME 3D THỂ THAO (Chỉ xuất hiện tại CTA) */}
      <AnimeCharacter
        characterRef={animeCharacterRef}
        headRef={animeHeadRef}
        mouthNeutralRef={animeMouthNeutralRef}
        mouthSmileRef={animeMouthSmileRef}
        blushRef={animeBlushRef}
        visible={false}
      />
    </>
  );
}

export default Sports3DScene;
