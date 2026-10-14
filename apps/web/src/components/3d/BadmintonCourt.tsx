'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

/**
 * Creates pixel-perfect Badminton Court CanvasTexture matching Diagram 1:
 * Dimension ratio: 13.41m x 6.1m (Vertical orientation)
 * High-contrast white lines on tournament green mat (#1e7e34)
 */
function createBadmintonCourtTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Apron outer border (Darker tournament green)
  ctx.fillStyle = '#165e27';
  ctx.fillRect(0, 0, w, h);

  // Exact court dimensions inside canvas (Width: 6.1m, Length: 13.41m)
  const courtW = 820;
  const courtH = 1800;
  const padX = (w - courtW) / 2; // 102px
  const padY = (h - courtH) / 2; // 124px
  const netY = h / 2; // Center net at Y = 1024px

  // 2. Main Court Floor (Vibrant, high-contrast tournament badminton green)
  ctx.fillStyle = '#22863a';
  ctx.fillRect(padX, padY, courtW, courtH);

  // Micro court texture lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let y = padY; y < padY + courtH; y += 18) {
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + courtW, y);
    ctx.stroke();
  }

  // 3. Official Court Lines (Thick, bold, pure white #FFFFFF for high visibility)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 14;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  // 3.1 Outer Boundary (Doubles Sidelines & Baselines: 20' x 44')
  ctx.strokeRect(padX, padY, courtW, courtH);

  // 3.2 Singles Sidelines (0.45m / 1' 6" inset each side = ~60px)
  const singleInset = Math.round(courtW * (0.45 / 6.1)); // ~60px
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(padX + singleInset, padY);
  ctx.lineTo(padX + singleInset, padY + courtH);
  ctx.moveTo(padX + courtW - singleInset, padY);
  ctx.lineTo(padX + courtW - singleInset, padY + courtH);
  ctx.stroke();

  // 3.3 Center Net Line
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(padX, netY);
  ctx.lineTo(padX + courtW, netY);
  ctx.stroke();

  // 3.4 Short Service Lines (1.98m / 6' 6" from net = ~265px)
  ctx.lineWidth = 13;
  const shortServiceDist = Math.round(courtH * (1.98 / 13.41)); // ~265px
  ctx.beginPath();
  // Top short service line
  ctx.moveTo(padX, netY - shortServiceDist);
  ctx.lineTo(padX + courtW, netY - shortServiceDist);
  // Bottom short service line
  ctx.moveTo(padX, netY + shortServiceDist);
  ctx.lineTo(padX + courtW, netY + shortServiceDist);
  ctx.stroke();

  // 3.5 Doubles Long Service Lines (0.76m / 2' 6" from back baselines = ~102px)
  const dblLongServiceDist = Math.round(courtH * (0.76 / 13.41)); // ~102px
  ctx.beginPath();
  // Top doubles long service line
  ctx.moveTo(padX, padY + dblLongServiceDist);
  ctx.lineTo(padX + courtW, padY + dblLongServiceDist);
  // Bottom doubles long service line
  ctx.moveTo(padX, padY + courtH - dblLongServiceDist);
  ctx.lineTo(padX + courtW, padY + courtH - dblLongServiceDist);
  ctx.stroke();

  // 3.6 Centerline (splits Left & Right service courts)
  // ONLY in service areas between short service line and back baseline
  const midX = w / 2;
  ctx.beginPath();
  // Top service courts centerline
  ctx.moveTo(midX, padY);
  ctx.lineTo(midX, netY - shortServiceDist);
  // Bottom service courts centerline
  ctx.moveTo(midX, netY + shortServiceDist);
  ctx.lineTo(midX, padY + courtH);
  ctx.stroke();

  // 4. Branding text on Apron
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COURTMATE BADMINTON', w / 2, padY - 36);
  ctx.fillText('COURTMATE BADMINTON', w / 2, padY + courtH + 62);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export interface BadmintonCourtProps {
  courtRef?: React.RefObject<THREE.Group>;
}

export function BadmintonCourt({ courtRef }: BadmintonCourtProps) {
  const texture = useMemo(() => createBadmintonCourtTexture(), []);

  return (
    <group ref={courtRef}>
      {/* 1. BASE COURT SLAB (Dark green beveled edges) */}
      <RoundedBox args={[2.45, 5.35, 0.06]} radius={0.03} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#165e27" roughness={0.6} />
      </RoundedBox>

      {/* 2. COURT PRINTED TOP SURFACE (Direct plane sitting on top of slab for guaranteed crisp lines!) */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[2.42, 5.32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.25}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. NET & POSTS AT Y = 0 (Horizontal across court width) */}
      {/* Left Net Post */}
      <mesh position={[-1.25, 0, 0.08]}>
        <boxGeometry args={[0.1, 0.1, 0.14]} />
        <meshStandardMaterial color="#451a14" roughness={0.5} />
      </mesh>
      <mesh position={[-1.25, 0, 0.28]}>
        <cylinderGeometry args={[0.024, 0.024, 0.45, 16]} />
        <meshStandardMaterial color="#2d1a18" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Right Net Post */}
      <mesh position={[1.25, 0, 0.08]}>
        <boxGeometry args={[0.1, 0.1, 0.14]} />
        <meshStandardMaterial color="#451a14" roughness={0.5} />
      </mesh>
      <mesh position={[1.25, 0, 0.28]}>
        <cylinderGeometry args={[0.024, 0.024, 0.45, 16]} />
        <meshStandardMaterial color="#2d1a18" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Net Mesh (Tilted slightly to be visible even from top-down) */}
      <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
        <planeGeometry args={[2.48, 0.36]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe={true}
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* White Net Top Tape (Horizontal) */}
      <mesh position={[0, 0, 0.44]}>
        <boxGeometry args={[2.5, 0.035, 0.035]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
    </group>
  );
}

export default BadmintonCourt;
