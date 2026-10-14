'use client';

import React from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { PickleballPaddle } from './PickleballPaddle';

export interface AnimeCharacterProps {
  characterRef?: React.RefObject<THREE.Group>;
  headRef?: React.RefObject<THREE.Group>;
  mouthNeutralRef?: React.RefObject<THREE.Group>;
  mouthSmileRef?: React.RefObject<THREE.Group>;
  blushRef?: React.RefObject<THREE.Group>;
  visible?: boolean;
}

/**
 * 3D Stylized Sports Mascot Character (Chibi Vinyl Figure style)
 * Full-body, well-rounded, charming proportions with sports cap and sneakers
 */
export function AnimeCharacter({
  characterRef,
  headRef,
  mouthNeutralRef,
  mouthSmileRef,
  blushRef,
  visible = false,
}: AnimeCharacterProps) {
  return (
    <group
      ref={characterRef}
      position={[-25, -1.0, 0]}
      scale={[0, 0, 0]}
      visible={visible}
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HEAD GROUP (Smooth rounded chibi head with 3D eyes & sports cap) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.48, 0]}>
        {/* Head Base (Seamless soft peach skin sphere) */}
        <mesh position={[0, 0, 0]} scale={[1, 1, 0.98]}>
          <sphereGeometry args={[0.48, 36, 36]} />
          <meshStandardMaterial color="#fcd5b8" roughness={0.35} metalness={0.02} />
        </mesh>

        {/* 3D Cute Glossy Eyes (Left & Right) */}
        {/* Left Eye */}
        <group position={[-0.16, 0.02, 0.43]}>
          <mesh>
            <sphereGeometry args={[0.048, 20, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          {/* Eye Sparkle / White Specular Highlight */}
          <mesh position={[-0.015, 0.015, 0.038]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          <mesh position={[0.015, -0.015, 0.038]}>
            <sphereGeometry args={[0.009, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.16, 0.02, 0.43]}>
          <mesh>
            <sphereGeometry args={[0.048, 20, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          {/* Eye Sparkle / White Specular Highlight */}
          <mesh position={[-0.015, 0.015, 0.038]}>
            <sphereGeometry args={[0.016, 12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          <mesh position={[0.015, -0.015, 0.038]}>
            <sphereGeometry args={[0.009, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} />
          </mesh>
        </group>

        {/* Cute 3D Pink Cheeks (Blush) */}
        <group ref={blushRef}>
          <mesh position={[-0.24, -0.08, 0.39]} rotation={[0, -0.3, 0]}>
            <circleGeometry args={[0.065, 20]} />
            <meshStandardMaterial color="#f43f5e" transparent={true} opacity={0.4} />
          </mesh>
          <mesh position={[0.24, -0.08, 0.39]} rotation={[0, 0.3, 0]}>
            <circleGeometry args={[0.065, 20]} />
            <meshStandardMaterial color="#f43f5e" transparent={true} opacity={0.4} />
          </mesh>
        </group>

        {/* 1. Neutral / Pout Mouth (Biểu cảm ban đầu khi đứng cạnh khung CTA) */}
        <group ref={mouthNeutralRef} position={[0, -0.11, 0.46]} rotation={[0.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.042, 0.008, 14, 28, Math.PI]} />
            <meshStandardMaterial color="#be123c" roughness={0.2} />
          </mesh>
        </group>

        {/* 2. Sweet Smiling Mouth (Đổi sang nụ cười rạng rỡ khi lướt xuống vào giữa màn hình) */}
        <group
          ref={mouthSmileRef}
          position={[0, -0.075, 0.46]}
          rotation={[0.2, 0, Math.PI]}
          scale={[0, 0, 0]}
        >
          {/* Cung môi cười hình chữ U ngược cực dễ thương */}
          <mesh>
            <torusGeometry args={[0.054, 0.009, 14, 28, Math.PI]} />
            <meshStandardMaterial color="#be123c" roughness={0.2} />
          </mesh>
          {/* Lòng môi hồng hào tạo chiều sâu nụ cười */}
          <mesh position={[0, -0.012, -0.004]} scale={[1.15, 0.6, 0.3]}>
            <sphereGeometry args={[0.038, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.3} />
          </mesh>
        </group>

        {/* Cute Ears */}
        <mesh position={[-0.47, 0, 0]} rotation={[0, 0, 0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fcd5b8" roughness={0.4} />
        </mesh>
        <mesh position={[0.47, 0, 0]} rotation={[0, 0, -0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fcd5b8" roughness={0.4} />
        </mesh>

        {/* ─── TRENDY 3D SPORTS CAP (Mũ Lưỡi Trai Thể Thao CourtMate) ─── */}
        <group position={[0, 0.16, -0.02]}>
          {/* Cap Crown (Half sphere sitting snugly on head) */}
          <mesh position={[0, 0.1, 0]} scale={[1.04, 0.95, 1.04]}>
            <sphereGeometry args={[0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1E5AA8" roughness={0.35} />
          </mesh>

          {/* Curved Cap Visor / Brim (pointing forward stylishly) */}
          <group position={[0, 0.02, 0.44]} rotation={[0.25, 0, 0]}>
            <RoundedBox args={[0.54, 0.035, 0.32]} radius={0.015} smoothness={4}>
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </RoundedBox>
          </group>

          {/* White Button on top of cap */}
          <mesh position={[0, 0.58, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>

          {/* White CourtMate Emblem on Cap front */}
          <mesh position={[0, 0.28, 0.48]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.14, 0.08, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>

          {/* Rounded Hair Clumps peeking out under cap (Back and Sides) */}
          <mesh position={[0, -0.08, -0.32]} scale={[1.1, 0.8, 0.7]}>
            <sphereGeometry args={[0.34, 20, 20]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[-0.38, -0.05, 0.1]} scale={[0.6, 0.9, 0.6]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0.38, -0.05, 0.1]} scale={[0.6, 0.9, 0.6]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. TORSO / BODY (Puffy rounded sports jersey / hoodie)               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <group position={[0, 0.72, 0]}>
        {/* Rounded Chubby Athletic Jersey */}
        <RoundedBox args={[0.78, 0.82, 0.54]} radius={0.22} smoothness={8} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1E5AA8" roughness={0.3} metalness={0.08} />
        </RoundedBox>

        {/* White Sport Collar */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.08, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>

        {/* White & Cyan Jersey Stripe Accent */}
        <mesh position={[0, 0.08, 0.28]}>
          <boxGeometry args={[0.48, 0.06, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.28]}>
          <boxGeometry args={[0.42, 0.04, 0.02]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} />
        </mesh>

        {/* ─── LEFT ARM (Resting cutely on hip with white sweatband) ─── */}
        <group position={[-0.48, 0.2, 0]} rotation={[0.2, 0.1, 0.45]}>
          {/* Upper Arm & Sleeve */}
          <RoundedBox args={[0.22, 0.48, 0.22]} radius={0.1} smoothness={4} position={[0, -0.15, 0]}>
            <meshStandardMaterial color="#1E5AA8" roughness={0.3} />
          </RoundedBox>
          {/* Forearm (Skin) */}
          <mesh position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.085, 0.08, 0.28, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.35} />
          </mesh>
          {/* White Wrist Sweatband */}
          <mesh position={[0, -0.46, 0]}>
            <cylinderGeometry args={[0.098, 0.098, 0.09, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* Cute Chubby Hand */}
          <mesh position={[0, -0.56, 0]}>
            <sphereGeometry args={[0.095, 16, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.35} />
          </mesh>
        </group>

        {/* ─── RIGHT ARM (Holding Paddle naturally in front) ─── */}
        <group position={[0.48, 0.2, 0]} rotation={[-0.3, 0.1, -0.35]}>
          {/* Sleeve */}
          <RoundedBox args={[0.22, 0.48, 0.22]} radius={0.1} smoothness={4} position={[0, -0.15, 0]}>
            <meshStandardMaterial color="#1E5AA8" roughness={0.3} />
          </RoundedBox>
          {/* Forearm */}
          <mesh position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.085, 0.08, 0.28, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.35} />
          </mesh>
          {/* White Wristband */}
          <mesh position={[0, -0.46, 0]}>
            <cylinderGeometry args={[0.098, 0.098, 0.09, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* Hand holding paddle */}
          <mesh position={[0, -0.56, 0]}>
            <sphereGeometry args={[0.095, 16, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.35} />
          </mesh>

          {/* Held 3D Paddle in hand */}
          <group position={[0, -0.35, 0.28]} rotation={[1.1, 0.2, 0.1]} scale={[0.48, 0.48, 0.48]}>
            <PickleballPaddle />
          </group>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. LOWER BODY (Rounded Sports Shorts, Socks, Chunky Sneakers)       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        {/* Dark Navy Sports Shorts */}
        <RoundedBox args={[0.74, 0.38, 0.52]} radius={0.12} smoothness={6} position={[0, 0.18, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </RoundedBox>
        {/* White side piping on shorts */}
        <mesh position={[-0.38, 0.18, 0]}>
          <boxGeometry args={[0.02, 0.34, 0.46]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.38, 0.18, 0]}>
          <boxGeometry args={[0.02, 0.34, 0.46]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* ─── LEGS & CHUNKY SNEAKERS (LEFT) ─── */}
        <group position={[-0.2, 0, 0]}>
          {/* Leg (Skin) */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.095, 0.09, 0.36, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.4} />
          </mesh>
          {/* White Athletic Sock with Blue Stripe */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.27, 0]}>
            <cylinderGeometry args={[0.103, 0.103, 0.035, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>

          {/* Chunky 3D Sneaker (Left) */}
          <group position={[0, -0.5, 0.08]}>
            {/* White Rubber Platform Sole */}
            <RoundedBox args={[0.25, 0.12, 0.46]} radius={0.05} smoothness={4} position={[0, -0.04, 0]}>
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </RoundedBox>
            {/* Blue & White Sneaker Upper */}
            <RoundedBox args={[0.23, 0.18, 0.38]} radius={0.07} smoothness={4} position={[0, 0.06, -0.02]}>
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </RoundedBox>
            {/* White Toe Cap */}
            <mesh position={[0, 0.04, 0.12]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          </group>
        </group>

        {/* ─── LEGS & CHUNKY SNEAKERS (RIGHT) ─── */}
        <group position={[0.2, 0, 0]}>
          {/* Leg (Skin) */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.095, 0.09, 0.36, 16]} />
            <meshStandardMaterial color="#fcd5b8" roughness={0.4} />
          </mesh>
          {/* White Athletic Sock with Blue Stripe */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.27, 0]}>
            <cylinderGeometry args={[0.103, 0.103, 0.035, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>

          {/* Chunky 3D Sneaker (Right) */}
          <group position={[0, -0.5, 0.08]}>
            {/* White Rubber Platform Sole */}
            <RoundedBox args={[0.25, 0.12, 0.46]} radius={0.05} smoothness={4} position={[0, -0.04, 0]}>
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </RoundedBox>
            {/* Blue & White Sneaker Upper */}
            <RoundedBox args={[0.23, 0.18, 0.38]} radius={0.07} smoothness={4} position={[0, 0.06, -0.02]}>
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </RoundedBox>
            {/* White Toe Cap */}
            <mesh position={[0, 0.04, 0.12]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default AnimeCharacter;
