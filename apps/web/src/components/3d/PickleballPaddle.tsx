'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

/**
 * Creates High-Resolution Raw Toray T700 Carbon Fiber Texture with
 * Authentic 2x2 Twill Weave & Sleek CourtMate Pro Sport Graphics
 */
function createCarbonPaddleTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Dark Charcoal Carbon Tone
  ctx.fillStyle = '#141518';
  ctx.fillRect(0, 0, w, h);

  // 2. High-precision 2x2 Twill Carbon Weave Pattern
  const tileSize = 16;
  for (let x = 0; x < w; x += tileSize) {
    for (let y = 0; y < h; y += tileSize) {
      const isDiagonal =
        (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 4 < 2;
      ctx.fillStyle = isDiagonal ? '#202228' : '#101114';
      ctx.fillRect(x, y, tileSize, tileSize);

      // Fine carbon strand filaments
      ctx.fillStyle = isDiagonal
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(x, y + 3, tileSize, 2);
      ctx.fillRect(x, y + 9, tileSize, 2);
    }
  }

  // 3. Subtle Vignette Depth
  const grad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    w * 0.25,
    w / 2,
    h / 2,
    w * 0.75,
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 4. Top Technical Spec Typography
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('16MM TORAY T700', w / 2, 115);

  ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('RAW CARBON FIBER CONTROL', w / 2, 148);

  // 5. Center Sweet Spot Crosshair & Speed Accents
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 30, 130, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 30, 65, 0, Math.PI * 2);
  ctx.stroke();

  // Cyan Speed Bar
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 110, h / 2 - 30);
  ctx.lineTo(w / 2 + 110, h / 2 - 30);
  ctx.stroke();

  // 6. Bold Iconic CourtMate Brand Logo
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COURTMATE', w / 2, h - 220);

  // Gradient Speed Underline
  const lineGrad = ctx.createLinearGradient(w / 2 - 140, 0, w / 2 + 140, 0);
  lineGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
  lineGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
  lineGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(w / 2 - 140, h - 195, 280, 5);

  // 7. USAPA Certification Badge
  ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('USAPA APPROVED', w / 2, h - 145);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export interface PickleballPaddleProps {
  paddleRef?: React.RefObject<THREE.Group>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/**
 * 3D Pro-Tournament Pickleball Paddle:
 * - Perfectly centered geometric pivot (0,0,0) for balanced X-crossing and rotation
 * - Seamless aerodynamic edge guard (no sharp clipping boxes)
 * - Raw T700 carbon fiber face with CourtMate Pro graphics
 * - Ergonomic neck collar with cyan accent ring
 * - White athletic cushion grip with spiral overlap ridges
 */
export function PickleballPaddle({
  paddleRef,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: PickleballPaddleProps) {
  const paddleTex = useMemo(() => createCarbonPaddleTexture(), []);

  return (
    <group ref={paddleRef} position={position} rotation={rotation} scale={scale}>
      {/* ─── 1. PADDLE BLADE & SEAMLESS EDGE GUARD (Centered at y = 0.50) ─── */}
      <group position={[0, 0.50, 0]}>
        {/* Sleek Rounded Edge Guard Bumper */}
        <RoundedBox
          args={[0.88, 1.34, 0.052]}
          radius={0.20}
          smoothness={6}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial color="#0c0d10" roughness={0.45} metalness={0.2} />
        </RoundedBox>

        {/* Carbon Fiber Face Blade */}
        <RoundedBox
          args={[0.85, 1.31, 0.054]}
          radius={0.18}
          smoothness={6}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial attach="material-0" color="#0c0d10" roughness={0.5} />
          <meshStandardMaterial attach="material-1" color="#0c0d10" roughness={0.5} />
          <meshStandardMaterial attach="material-2" color="#0c0d10" roughness={0.5} />
          <meshStandardMaterial attach="material-3" color="#0c0d10" roughness={0.5} />
          <meshStandardMaterial
            attach="material-4"
            map={paddleTex}
            roughness={0.32}
            metalness={0.12}
          />
          <meshStandardMaterial
            attach="material-5"
            map={paddleTex}
            roughness={0.32}
            metalness={0.12}
          />
        </RoundedBox>

        {/* Tapered Throat */}
        <mesh position={[0, -0.66, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.12, 20]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.4} />
        </mesh>
      </group>

      {/* ─── 2. NECK COLLAR & SILICONE RING ─── */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.06, 24]} />
        <meshStandardMaterial color="#111317" roughness={0.3} />
      </mesh>
      {/* Cyan Accent Ring on Collar */}
      <mesh position={[0, -0.22, 0]}>
        <torusGeometry args={[0.063, 0.005, 12, 24]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.2} />
      </mesh>

      {/* ─── 3. ATHLETIC GRIP HANDLE (Centered at y = -0.65) ─── */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.054, 0.056, 0.76, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Spiral Grip Tape Ridges */}
      {[-0.38, -0.49, -0.60, -0.71, -0.82, -0.93].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.056, 0.0045, 10, 24]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
      ))}

      {/* ─── 4. ERGONOMIC BUTT CAP ─── */}
      <mesh position={[0, -1.06, 0]}>
        <cylinderGeometry args={[0.066, 0.062, 0.06, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Bottom Cap Logo Plate */}
      <mesh position={[0, -1.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default PickleballPaddle;
