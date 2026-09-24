'use client';

import React, { useEffect, useRef } from 'react';

export const CursorBackground = () => {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  // Use refs for positions to avoid re-renders during animation
  const mouse = useRef({ x: 0, y: 0 });
  const pos1 = useRef({ x: 0, y: 0 });
  const pos2 = useRef({ x: 0, y: 0 });
  const pos3 = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initial center position
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;
    pos1.current = { ...mouse.current };
    pos2.current = { ...mouse.current };
    pos3.current = { ...mouse.current };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      // Lerp factors (smaller = slower following effect)
      const ease1 = 0.06;
      const ease2 = 0.03;
      const ease3 = 0.015;

      // Update positions with lerp
      pos1.current.x += (mouse.current.x - pos1.current.x) * ease1;
      pos1.current.y += (mouse.current.y - pos1.current.y) * ease1;

      pos2.current.x += (mouse.current.x - pos2.current.x) * ease2;
      pos2.current.y += (mouse.current.y - pos2.current.y) * ease2;

      pos3.current.x += (mouse.current.x - pos3.current.x) * ease3;
      pos3.current.y += (mouse.current.y - pos3.current.y) * ease3;

      // Apply transforms
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate3d(${pos1.current.x}px, ${pos1.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate3d(${pos2.current.x}px, ${pos2.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate3d(${pos3.current.x}px, ${pos3.current.y}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FFFBF7]">
      {/* Tiny dots grid pattern (chấm li ti đằng sau) */}
      <div 
        className="absolute inset-0 opacity-[0.3]" 
        style={{
          backgroundImage: 'radial-gradient(#1E5AA8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Interactive Cursor Tracking Blobs */}
      <div
        ref={blob1Ref}
        className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-[#1E5AA8]/30 blur-[100px] mix-blend-multiply will-change-transform"
      />
      <div
        ref={blob2Ref}
        className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full bg-[#3B82F6]/20 blur-[120px] mix-blend-multiply will-change-transform"
      />
      <div
        ref={blob3Ref}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/10 blur-[140px] mix-blend-multiply will-change-transform"
      />

      {/* A subtle static vignette overlay to make it look premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FFFBF7]/80" />
    </div>
  );
};
