'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Creates High-Resolution Orthogonal Badminton String Bed Texture with
 * Authentic Cross-String Grid & CourtMate Stencil Mark
 */
function createBadmintonStringTexture(): THREE.CanvasTexture {
  if (typeof window === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  // Clip to Oval Badminton Head Shape
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 445, 490, 0, 0, Math.PI * 2);
  ctx.clip();

  // 1. Draw Vertical Main Strings
  const vSpacing = 36;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2.8;

  for (let x = cx - 410; x <= cx + 410; x += vSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // 2. Draw Horizontal Cross Strings
  const hSpacing = 38;
  for (let y = cy - 460; y <= cy + 460; y += hSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 3. CourtMate Sweet-spot Stencil Logo
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 105, Math.PI * 0.22, Math.PI * 1.78, false);
  ctx.stroke();

  // Speed dot accent
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx + 80, cy - 8, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export interface BadmintonRacketProps {
  racketRef?: React.RefObject<THREE.Group>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/**
 * 3D Pro Tournament Badminton Racket:
 * - Perfectly centered geometric pivot (0,0,0) for balanced X-crossing and rotation
 * - Isometric aerodynamic frame with Pearl White & Deep Navy / Cyan CourtMate livery
 * - Authentic orthogonal cross-string grid with sweet-spot stencil logo
 * - Inner grommet strip protecting strings
 * - Slim graphite shaft with aerodynamic decals
 * - Athletic cushion grip with finishing tape & CourtMate butt cap
 */
export function BadmintonRacket({
  racketRef,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: BadmintonRacketProps) {
  const stringTex = useMemo(() => createBadmintonStringTexture(), []);

  return (
    <group ref={racketRef} position={position} rotation={rotation} scale={scale}>
      {/* ─── 1. ISOMETRIC RACKET HEAD & STRINGS (Centered at y = 0.95) ─── */}
      <group position={[0, 0.95, 0]} scale={[0.85, 1.15, 1]}>
        {/* Main Aerodynamic Frame (Pearl White Metal) */}
        <mesh>
          <torusGeometry args={[0.58, 0.028, 20, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Inner Grommet Strip */}
        <mesh>
          <torusGeometry args={[0.555, 0.007, 12, 64]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* Top Head Bumper Decal (Deep Navy & Electric Cyan) */}
        <group position={[0, 0.58, 0]} scale={[1.18, 0.85, 1.1]}>
          <mesh>
            <torusGeometry args={[0.08, 0.029, 16, 24, Math.PI]} />
            <meshStandardMaterial
              color="#0284c7"
              metalness={0.5}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* 3 O'clock & 9 O'clock Aerodynamic Speed Bands */}
        <group position={[-0.58, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 16]} />
            <meshStandardMaterial
              color="#1848FF"
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        </group>
        <group position={[0.58, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 16]} />
            <meshStandardMaterial
              color="#1848FF"
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* Authentic Orthogonal String Bed */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.18, 1.18]} />
          <meshStandardMaterial
            map={stringTex}
            transparent={true}
            opacity={0.92}
            side={THREE.DoubleSide}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* ─── 2. BUILT-IN SOLID T-JOINT ─── */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.14, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Cyan T-Joint Emblem Ring */}
      <mesh position={[0, 0.28, 0]}>
        <torusGeometry args={[0.044, 0.005, 10, 20]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ─── 3. ULTRA-SLIM GRAPHITE SHAFT (Centered around y = -0.32) ─── */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.14, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Upper & Mid Shaft Speed Rings */}
      <mesh position={[0, -0.10, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.16, 20]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 20]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ─── 4. CONTROL SUPPORT CONE ─── */}
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.024, 0.046, 0.09, 20]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.025, 20]} />
        <meshStandardMaterial color="#1848FF" roughness={0.3} />
      </mesh>

      {/* ─── 5. ATHLETIC GRIP HANDLE ─── */}
      {/* White Finishing Tape */}
      <mesh position={[0, -0.99, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.99, 0]}>
        <torusGeometry args={[0.051, 0.003, 10, 20]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>

      {/* Main Polyurethane Grip */}
      <mesh position={[0, -1.26, 0]}>
        <cylinderGeometry args={[0.048, 0.052, 0.52, 20]} />
        <meshStandardMaterial color="#18191c" roughness={0.8} />
      </mesh>

      {/* Spiral Grip Ridges */}
      {[-1.07, -1.15, -1.23, -1.31, -1.39, -1.47].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.052, 0.004, 10, 24]} />
          <meshStandardMaterial color="#09090b" roughness={0.9} />
        </mesh>
      ))}

      {/* ─── 6. BUTT CAP ─── */}
      <mesh position={[0, -1.54, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, -1.57, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.052, 24]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default BadmintonRacket;
