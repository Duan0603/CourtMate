'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useAuth } from '../../context/AuthContext';
import { Sports3DScene } from './Sports3DScene';
import { SportsOverlays } from './SportsOverlays';

/**
 * SportsShowcase3D
 * Interactive 3D courts & athletic story showcase pinned during scroll.
 * Features Badminton & Pickleball 3D courts, dual rackets, and anime mascot.
 */
export function SportsShowcase3D() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      id="story-pin-container"
      className="h-screen w-full relative overflow-hidden bg-[#FAFAFA]"
    >
      {/* Dynamic Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,90,168,0.12),transparent_70%)] z-0 pointer-events-none" />

      {/* 3D CANVAS */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 8.2], fov: 45 }}>
          <ambientLight intensity={1.3} />
          <directionalLight position={[6, 12, 6]} intensity={2.4} castShadow />
          <directionalLight position={[-6, 4, 4]} intensity={1.0} color="#38bdf8" />
          <Environment preset="city" />
          <Suspense fallback={null}>
            <Sports3DScene isAuthenticated={isAuthenticated} />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Overlays & CTA */}
      <SportsOverlays isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default SportsShowcase3D;
