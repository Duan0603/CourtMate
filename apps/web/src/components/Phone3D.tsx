'use client';

import React, { useRef, useLayoutEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, RoundedBox, useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

function PhoneMesh({ isAuthenticated }: { isAuthenticated: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);
  
  // Load textures
  const texture1 = useTexture('/feat-search.png');
  texture1.anisotropy = 16;
  
  // Materials
  const materialSide = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.8 }), []);
  const materialFront = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: texture1, 
    roughness: 0.2, 
    metalness: 0.1,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: texture1,
    emissiveIntensity: 0.02 // Starts very dark
  }), [texture1]);
  
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    const splitInstances: any[] = [];
    
    const ctx = gsap.context(() => {
      // Initial state: phone is large, horizontal, centered
      meshRef.current!.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
      meshRef.current!.scale.set(1.5, 1.5, 1.5);
      meshRef.current!.position.set(0, 0, 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#story-pin-container',
          start: 'top top',
          end: '+=500%',
          scrub: 1,
          pin: true,
        }
      });

      // Phase 1: Text fades in OVER the phone
      tl.to('.intro-text', { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 0);
      tl.to('.intro-text', { opacity: 0, scale: 1.1, duration: 0.5 }, 1.5);

      // Phase 2: Phone rotates to vertical, scales down, moves left
      tl.to(meshRef.current!.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 1.0);
      
      tl.to(meshRef.current!.scale, {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 1.0);

      tl.to(meshRef.current!.position, {
        x: -3.5,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 1.0);

      // Move shadow down to avoid clipping when phone is vertical
      tl.fromTo(shadowRef.current!.position,
        { y: -1.0 },
        { y: -3.5, duration: 1.5, ease: 'power2.inOut' },
        1.0
      );

      // Brighten phone screen
      tl.to(materialFront, {
         emissiveIntensity: 1.2,
         duration: 1.5,
         ease: 'power2.inOut'
      }, 1.5);

      // Background glows up
      tl.to('.screen-glow', {
         opacity: 1,
         duration: 1.5,
         ease: 'power2.inOut'
      }, 1.5);

      // Phase 3: Fade in 3 features sequentially (no overlap)
      const storyFeatures = gsap.utils.toArray('.story-feature');
      
      storyFeatures.forEach((feat: any, i) => {
        const heading = feat.querySelector('.feature-heading');
        const para = feat.querySelector('.feature-para');
        
        // Split text setup
        const splitHeading = new SplitText(heading, { type: 'words' });
        const splitPara = new SplitText(para, { type: 'chars,words,lines' });
        splitInstances.push(splitHeading, splitPara);
        
        // Initial state for this feature
        gsap.set(feat, { x: -150, opacity: 0, scale: 0.9 });
        gsap.set(splitPara.chars, { y: -25, opacity: 0 });

        const tlFeature = gsap.timeline();
        
        // 1. Text comes OUT of the phone (starts from left x: -150)
        tlFeature.to(feat, { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' });

        // 2. Heading "scrub each word"
        tlFeature.fromTo(splitHeading.words, 
          { opacity: 0.2 },
          { opacity: 1, stagger: 0.1, duration: 1 },
          "-=0.4"
        );

        // 3. Paragraph "letters slide down"
        tlFeature.to(splitPara.chars, 
          { y: 0, opacity: 1, stagger: 0.02, duration: 1 },
          "-=0.8"
        );

        // Rotate phone slightly for each feature to show 3D nature
        tlFeature.to(meshRef.current!.rotation, {
          y: (i + 1) * 0.15,
          duration: 1
        }, 0);

        // Hold so user can read
        tlFeature.to({}, { duration: 1.5 });

        // Outro if not last
        if (i < storyFeatures.length - 1) {
          tlFeature.to(feat, {
            x: 150,
            opacity: 0,
            duration: 0.6
          });
        }
        
        // Add sequential timeline to main timeline! This prevents overlapping!
        tl.add(tlFeature);
      });

      // Phase 4: Hide everything and show CTA (Always show, content changes based on auth)
      const ctaTl = gsap.timeline();
      ctaTl.to('.story-feature', { opacity: 0, duration: 0.5 }, 0);
      ctaTl.to('.story-cta', { opacity: 1, pointerEvents: 'auto', duration: 1 }, 0.5);
      tl.add(ctaTl);

      // Phase 5: Outro animation (flip down to horizontal center)
      const outroTl = gsap.timeline();
      outroTl.to({}, { duration: 1.0 }); // Hold CTA for a bit
      
      // Move phone to center and lay flat face down
      outroTl.to(meshRef.current!.position, { x: 0, y: 0, duration: 1.5, ease: 'power2.inOut' }, 1.0);
      outroTl.to(meshRef.current!.rotation, { x: Math.PI / 2, y: 0, z: -Math.PI / 4, duration: 1.5, ease: 'power2.inOut' }, 1.0);
      outroTl.to(meshRef.current!.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.5, ease: 'power2.inOut' }, 1.0);
      
      outroTl.to(shadowRef.current!.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' }, 1.0);
      outroTl.to('.story-cta', { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 1.0);
      outroTl.to('.screen-glow', { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 1.0);
      
      // Show bouncing arrow at the very end
      outroTl.to('.story-scroll-indicator', { opacity: 1, duration: 0.5 }, 2.0);
      
      tl.add(outroTl);

    });

    return () => {
      splitInstances.forEach(inst => inst.revert());
      ctx.revert();
    }
  }, [materialFront, isAuthenticated]);

  return (
    <>
      <group ref={meshRef}>
        <RoundedBox args={[3.2, 6.5, 0.2]} radius={0.15} smoothness={4}>
           <meshStandardMaterial attach="material-0" {...materialSide} />
           <meshStandardMaterial attach="material-1" {...materialSide} />
           <meshStandardMaterial attach="material-2" {...materialSide} />
           <meshStandardMaterial attach="material-3" {...materialSide} />
           <primitive attach="material-4" object={materialFront} />
           <meshStandardMaterial attach="material-5" {...materialSide} />
        </RoundedBox>
      </group>
      <group ref={shadowRef}>
        <ContactShadows opacity={0.75} scale={20} blur={2.5} far={4} resolution={512} color="#000000" />
      </group>
    </>
  );
}

export default function Phone3D() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ctaBtnRef.current) return;
    const rect = ctaBtnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(ctaBtnRef.current, {
      rotationY: x / 5,
      rotationX: -y / 5,
      ease: 'power2.out',
      duration: 0.5
    });
  };

  const handleMouseLeave = () => {
    if (!ctaBtnRef.current) return;
    gsap.to(ctaBtnRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: 'power2.out',
      duration: 0.5
    });
  };

  return (
    <div id="story-pin-container" className="h-screen w-full relative overflow-hidden bg-[#FAFAFA]">
      
      {/* Glow Effect */}
      <div className="screen-glow absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(30,90,168,0.15),transparent_60%)] opacity-0 z-0 pointer-events-none"></div>

      <div className="absolute inset-0 z-10">
         <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 10, 5]} intensity={2.5} castShadow />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <PhoneMesh isAuthenticated={isAuthenticated} />
            </Suspense>
         </Canvas>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
         {/* Text over phone */}
         <h2 
           className="intro-text text-5xl md:text-7xl font-black opacity-0 scale-90 text-center -translate-y-24"
           style={{
             color: '#101828',
             textShadow: '0 0 40px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.8)'
           }}
         >
           Sẵn Sàng<br/><span className="text-[#1E5AA8]">Trải Nghiệm?</span>
         </h2>
      </div>

      {/* HTML Features overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none">
            
            {/* Feature 1 */}
            <div className="story-feature absolute left-[45%] md:left-[50%] top-1/2 -translate-y-1/2 w-full max-w-[450px] opacity-0 pointer-events-auto">
               <div className="relative">
                 <div className="absolute -top-16 -left-12 text-[150px] font-black text-transparent pointer-events-none select-none" style={{ WebkitTextStroke: '4px rgba(16, 24, 40, 0.05)' }}>
                   01
                 </div>
                 <h2 className="feature-heading text-4xl md:text-5xl font-black leading-[1.1] text-[#1E5AA8] relative z-10 mb-4">Mọi Giải Đấu,<br/>Một Nền Tảng</h2>
                 <p className="feature-para text-lg text-[#475467] font-medium relative z-10">Truy cập thông tin chi tiết về mọi giải đấu đang diễn ra. Từ quy định, cơ cấu giải thưởng đến số lượng đăng ký.</p>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="story-feature absolute left-[45%] md:left-[50%] top-1/2 -translate-y-1/2 w-full max-w-[450px] opacity-0 pointer-events-auto">
               <div className="relative">
                 <div className="absolute -top-16 -left-12 text-[150px] font-black text-transparent pointer-events-none select-none" style={{ WebkitTextStroke: '4px rgba(16, 24, 40, 0.05)' }}>
                   02
                 </div>
                 <h2 className="feature-heading text-4xl md:text-5xl font-black leading-[1.1] text-[#1E5AA8] relative z-10 mb-4">Tìm Kiếm Nhanh Chóng,<br/>Chính Xác</h2>
                 <p className="feature-para text-lg text-[#475467] font-medium relative z-10">Bộ lọc nâng cao cho phép bạn tìm kiếm theo khu vực, thời gian và trình độ. Tiết kiệm thời gian, tập trung thi đấu.</p>
               </div>
            </div>

            {/* Feature 3 */}
            <div className="story-feature absolute left-[45%] md:left-[50%] top-1/2 -translate-y-1/2 w-full max-w-[450px] opacity-0 pointer-events-auto">
               <div className="relative">
                 <div className="absolute -top-16 -left-12 text-[150px] font-black text-transparent pointer-events-none select-none" style={{ WebkitTextStroke: '4px rgba(16, 24, 40, 0.05)' }}>
                   03
                 </div>
                 <h2 className="feature-heading text-4xl md:text-5xl font-black leading-[1.1] text-[#1E5AA8] relative z-10 mb-4">Không Bỏ Lỡ<br/>Bất Kỳ Cơ Hội Nào</h2>
                 <p className="feature-para text-lg text-[#475467] font-medium relative z-10">Nhận thông báo ngay lập tức khi có giải đấu mới phù hợp với hồ sơ của bạn. Cập nhật lịch thi đấu tự động.</p>
               </div>
            </div>

      </div>

      {/* CTA Section (Shows up at the very end, content adapts to auth) */}
      <div className="story-cta absolute left-[45%] md:left-[50%] top-1/2 -translate-y-1/2 w-full max-w-[450px] opacity-0 pointer-events-none z-40">
        <div className="w-full rounded-[2.5rem] bg-[#1E5AA8] text-white p-8 md:p-10 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/feat-search.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10 tracking-tight leading-tight">Sẵn Sàng Để Bắt Đầu?</h2>
          <p className="text-base md:text-lg font-medium mb-8 relative z-10 text-white/90">Tham gia mạng lưới thể thao phát triển nhanh nhất Đà Nẵng ngay hôm nay.</p>
          <div style={{ perspective: '1000px' }} className="inline-block relative z-10 w-full">
            <button 
              ref={ctaBtnRef}
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/tournaments');
                } else {
                  router.push('/tournaments');
                }
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full bg-white text-[#1E5AA8] px-6 py-4 rounded-full font-bold text-sm md:text-base shadow-xl flex items-center justify-center gap-2" 
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
               {isAuthenticated ? "Tìm Kiếm Giải Đấu" : "Tạo Tài Khoản Miễn Phí"}
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M5 12h14M12 5l7 7-7 7"/>
               </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator for Outro */}
      <div className="story-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-40 opacity-0 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center animate-bounce border border-slate-100">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E5AA8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
           </svg>
        </div>
      </div>
    </div>
  );
}
