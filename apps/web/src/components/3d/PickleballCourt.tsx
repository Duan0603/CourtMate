'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

/**
 * Creates pixel-perfect Pickleball Court CanvasTexture matching Diagram 2:
 * - Apron: Sage green (#769877)
 * - Service Areas (15 ft): Rich Deep Blue (#0277bd)
 * - Non-Volley Zone / Kitchen (7 ft each side = 14 ft total): Warm Amber/Orange (#f59e0b)
 * - Thick, high-contrast pure white lines (#FFFFFF)
 */
function createPickleballCourtTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Apron outer border (Sage green matching Diagram 2)
  ctx.fillStyle = '#6d8c6e';
  ctx.fillRect(0, 0, w, h);

  // Exact court dimensions inside canvas (Width: 20 ft / 6.1m, Length: 44 ft / 13.41m)
  const courtW = 820;
  const courtH = 1800;
  const padX = (w - courtW) / 2; // 102px
  const padY = (h - courtH) / 2; // 124px
  const netY = h / 2; // Center net at Y = 1024px

  // 2. Service Areas (15 ft / 4.57m each side): Rich Deep Blue (#0277bd)
  ctx.fillStyle = '#0277bd';
  ctx.fillRect(padX, padY, courtW, courtH);

  // 3. Non-Volley Zone / "Kitchen" (7 ft / 2.13m on each side of net = total 14 ft / 4.27m):
  // Warm Amber / Orange (#f59e0b) matching Diagram 2
  const kitchenDist = Math.round(courtH * (2.13 / 13.41)); // ~286px
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(padX, netY - kitchenDist, courtW, kitchenDist * 2);

  // Micro court texture lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let y = padY; y < padY + courtH; y += 18) {
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + courtW, y);
    ctx.stroke();
  }

  // 4. Official White Lines (solid, pure white #FFFFFF for high contrast)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 14;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  // 4.1 Outer Boundary (Baselines & Sidelines: 20' x 44')
  ctx.strokeRect(padX, padY, courtW, courtH);

  // 4.2 Center Net Line (horizontal line under net)
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(padX, netY);
  ctx.lineTo(padX + courtW, netY);
  ctx.stroke();

  // 4.3 Non-Volley Zone Lines (Kitchen Lines at 7 ft from net on each side)
  ctx.lineWidth = 14;
  ctx.beginPath();
  // Top kitchen line
  ctx.moveTo(padX, netY - kitchenDist);
  ctx.lineTo(padX + courtW, netY - kitchenDist);
  // Bottom kitchen line
  ctx.moveTo(padX, netY + kitchenDist);
  ctx.lineTo(padX + courtW, netY + kitchenDist);
  ctx.stroke();

  // 4.4 Centerline (divides Left & Right Service Area: 15 ft)
  // Only runs in the blue service areas (NO centerline inside the amber Kitchen!)
  const midX = w / 2;
  ctx.beginPath();
  // Top service area centerline
  ctx.moveTo(midX, padY);
  ctx.lineTo(midX, netY - kitchenDist);
  // Bottom service area centerline
  ctx.moveTo(midX, netY + kitchenDist);
  ctx.lineTo(midX, padY + courtH);
  ctx.stroke();

  // 5. Text Labels (Matching Diagram 2)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'center';

  // "Non-Volley Zone / Kitchen" text
  ctx.fillText('Non-Volley Zone / Kitchen', w / 2, netY - kitchenDist / 2);
  ctx.fillText('Non-Volley Zone / Kitchen', w / 2, netY + kitchenDist / 2 + 10);

  // Service Areas text
  ctx.font = 'bold 26px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Right Service Area', padX + courtW * 0.25, padY + (netY - kitchenDist - padY) / 2);
  ctx.fillText('Left Service Area', padX + courtW * 0.75, padY + (netY - kitchenDist - padY) / 2);

  ctx.fillText('Left Service Area', padX + courtW * 0.25, netY + kitchenDist + (padY + courtH - netY - kitchenDist) / 2);
  ctx.fillText('Right Service Area', padX + courtW * 0.75, netY + kitchenDist + (padY + courtH - netY - kitchenDist) / 2);

  // Apron branding
  ctx.font = '900 36px sans-serif';
  ctx.fillText('COURTMATE PICKLEBALL', w / 2, padY - 36);
  ctx.fillText('COURTMATE PICKLEBALL', w / 2, padY + courtH + 62);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export interface PickleballCourtProps {
  courtRef?: React.RefObject<THREE.Group>;
}

export function PickleballCourt({ courtRef }: PickleballCourtProps) {
  const texture = useMemo(() => createPickleballCourtTexture(), []);

  return (
    <group ref={courtRef}>
      {/* 1. BASE COURT SLAB (Sage green beveled edges) */}
      <RoundedBox args={[2.45, 5.35, 0.06]} radius={0.03} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#556e56" roughness={0.6} />
      </RoundedBox>

      {/* 2. COURT PRINTED TOP SURFACE (Direct plane sitting on top of slab for guaranteed crisp rendering!) */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[2.42, 5.32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. NET & POSTS AT Y = 0 (Horizontal across court width, Pickleball net height: 34-36 in) */}
      {/* Left Net Post (white/light grey matching Diagram 2) */}
      <mesh position={[-1.25, 0, 0.18]}>
        <cylinderGeometry args={[0.024, 0.024, 0.38, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Right Net Post */}
      <mesh position={[1.25, 0, 0.18]}>
        <cylinderGeometry args={[0.024, 0.024, 0.38, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} metalness={0.4} />
      </mesh>

      {/* Net Mesh (Tilted slightly to be visible even from top-down) */}
      <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
        <planeGeometry args={[2.48, 0.28]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe={true}
          transparent={true}
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* White Net Top Tape (Horizontal) */}
      <mesh position={[0, 0, 0.32]}>
        <boxGeometry args={[2.5, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
    </group>
  );
}

export default PickleballCourt;
