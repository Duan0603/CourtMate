'use client';

import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export interface SportsSceneRefs {
  badmintonCourtRef: React.RefObject<THREE.Group>;
  pickleballCourtRef: React.RefObject<THREE.Group>;
  crossXGroupRef: React.RefObject<THREE.Group>;
  crossBadmintonRef: React.RefObject<THREE.Group>;
  crossPickleballRef: React.RefObject<THREE.Group>;
  dualRacketsGroupRef: React.RefObject<THREE.Group>;
  dualBadmintonRef: React.RefObject<THREE.Group>;
  dualPickleballRef: React.RefObject<THREE.Group>;
  animeCharacterRef: React.RefObject<THREE.Group>;
  animeHeadRef: React.RefObject<THREE.Group>;
  animeMouthNeutralRef: React.RefObject<THREE.Group>;
  animeMouthSmileRef: React.RefObject<THREE.Group>;
  animeBlushRef: React.RefObject<THREE.Group>;
}

/**
 * Custom hook orchestrating the complete 8-step GSAP ScrollTrigger timeline
 * for the 3D Sports Showcase (Courts, Rackets, Anime Mascot & HTML Overlays).
 */
export function useSportsTimeline(refs: SportsSceneRefs, isAuthenticated: boolean) {
  useLayoutEffect(() => {
    const {
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
    } = refs;

    if (
      !badmintonCourtRef.current ||
      !pickleballCourtRef.current ||
      !crossXGroupRef.current ||
      !crossBadmintonRef.current ||
      !crossPickleballRef.current ||
      !dualRacketsGroupRef.current ||
      !dualBadmintonRef.current ||
      !dualPickleballRef.current ||
      !animeCharacterRef.current ||
      !animeHeadRef.current
    ) {
      return;
    }

    const splitInstances: any[] = [];

    const ctx = gsap.context(() => {
      // ──────────────────────────────────────────────────────────────────────
      // 0. INITIAL STATE (TOP-DOWN VIEW)
      // ──────────────────────────────────────────────────────────────────────
      // 2 Courts: placed side-by-side, perfectly flat facing camera
      badmintonCourtRef.current!.position.set(-1.55, 0.35, 0);
      badmintonCourtRef.current!.rotation.set(0, 0, 0);
      badmintonCourtRef.current!.scale.set(1, 1, 1);
      badmintonCourtRef.current!.visible = true;

      pickleballCourtRef.current!.position.set(1.55, 0.35, 0);
      pickleballCourtRef.current!.rotation.set(0, 0, 0);
      pickleballCourtRef.current!.scale.set(1, 1, 1);
      pickleballCourtRef.current!.visible = true;

      // Crossed X Rackets: initially hidden & scaled 0, perfectly centered at (0, 0.15, 1.2)
      crossXGroupRef.current!.position.set(0, 0.15, 1.2);
      crossXGroupRef.current!.scale.set(0, 0, 0);
      crossXGroupRef.current!.rotation.set(0, 0, 0);
      crossXGroupRef.current!.visible = false;
      crossBadmintonRef.current!.position.set(0, 0, 0.05);
      crossBadmintonRef.current!.rotation.set(0, 0, 0.72);
      crossPickleballRef.current!.position.set(0, 0, -0.05);
      crossPickleballRef.current!.rotation.set(0, 0, -0.72);

      // Dual Rackets (Feature 03): initially hidden & scaled 0
      dualRacketsGroupRef.current!.position.set(0, 0, 1.0);
      dualRacketsGroupRef.current!.scale.set(0, 0, 0);
      dualRacketsGroupRef.current!.visible = false;
      dualBadmintonRef.current!.position.set(-6, 0, 0);
      dualBadmintonRef.current!.rotation.set(0, 0, 0.4);
      dualPickleballRef.current!.position.set(6, 0, 0);
      dualPickleballRef.current!.rotation.set(0, 0, -0.4);

      // Anime Character: strictly invisible & offscreen at start
      animeCharacterRef.current!.position.set(-25, -1.0, 0);
      animeCharacterRef.current!.scale.set(0, 0, 0);
      animeCharacterRef.current!.visible = false;
      animeHeadRef.current!.rotation.set(0, 0.2, 0);
      if (animeMouthNeutralRef.current) {
        animeMouthNeutralRef.current.scale.set(1, 1, 1);
      }
      if (animeMouthSmileRef.current) {
        animeMouthSmileRef.current.scale.set(0, 0, 0);
      }
      if (animeBlushRef.current) {
        animeBlushRef.current.scale.set(1, 1, 1);
      }

      // ──────────────────────────────────────────────────────────────────────
      // MAIN SCROLLTIMELINE
      // ──────────────────────────────────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#story-pin-container',
          start: 'top top',
          end: '+=850%',
          scrub: 1,
          pin: true,
        },
      });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 1: 2 SÂN TÁCH SANG 2 BÊN -> BIẾN MẤT HOÀN TOÀN
      // HIỆN CHỮ "SẴN SÀNG TRẢI NGHIỆM" VÀ 2 CÂY VỢT CHỮ X
      // ──────────────────────────────────────────────────────────────────────
      tl.to(
        badmintonCourtRef.current!.position,
        { x: -25, y: 1.0, duration: 1.2, ease: 'power2.inOut' },
        0,
      );
      tl.to(
        badmintonCourtRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 1.2 },
        0,
      );
      tl.set(badmintonCourtRef.current!, { visible: false }, 1.2);

      tl.to(
        pickleballCourtRef.current!.position,
        { x: 25, y: -1.0, duration: 1.2, ease: 'power2.inOut' },
        0,
      );
      tl.to(
        pickleballCourtRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 1.2 },
        0,
      );
      tl.set(pickleballCourtRef.current!, { visible: false }, 1.2);

      // 2 cây vợt chữ X xuất hiện ở trung tâm
      tl.set(crossXGroupRef.current!, { visible: true }, 0.1);
      tl.to(
        crossXGroupRef.current!.scale,
        { x: 1.25, y: 1.25, z: 1.25, duration: 1.1, ease: 'back.out(1.4)' },
        0.2,
      );
      tl.to(
        crossXGroupRef.current!.rotation,
        { z: 0, duration: 1.1, ease: 'power2.out' },
        0.2,
      );

      // Chữ "Sẵn Sàng Trải Nghiệm?" hiện ra to rõ ở giữa
      tl.to(
        '.intro-text',
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        0.3,
      );

      // Hold reading
      tl.to({}, { duration: 0.6 });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 2: CHỮ BAY LÊN TRÊN, 2 CÂY VỢT TÁCH RA 2 HƯỚNG VÀ BIẾN MẤT
      // ──────────────────────────────────────────────────────────────────────
      tl.to('.intro-text', {
        y: -180,
        opacity: 0,
        scale: 1.08,
        duration: 0.8,
        ease: 'power2.in',
      });
      tl.to(
        crossBadmintonRef.current!.position,
        { x: -22, y: 18, duration: 1.0, ease: 'power2.in' },
        '<',
      );
      tl.to(
        crossPickleballRef.current!.position,
        { x: 22, y: -18, duration: 1.0, ease: 'power2.in' },
        '<',
      );
      tl.to(
        crossXGroupRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 0.8 },
        '<+=0.2',
      );
      tl.set(crossXGroupRef.current!, { visible: false }, '>');

      // ──────────────────────────────────────────────────────────────────────
      // STEP 3: TÍNH NĂNG 01 -> SÂN CẦU LÔNG LƯỚT TỪ TRÁI THEO GÓC NGHIÊNG 3D
      // ──────────────────────────────────────────────────────────────────────
      tl.set(badmintonCourtRef.current!, { visible: true });
      tl.set(badmintonCourtRef.current!.position, { x: -20, y: 0.45, z: 0.2 });
      tl.set(badmintonCourtRef.current!.rotation, {
        x: -0.72,
        y: 0.38,
        z: -0.22,
      });
      tl.set(badmintonCourtRef.current!.scale, { x: 0.9, y: 0.9, z: 0.9 });

      tl.to(badmintonCourtRef.current!.position, {
        x: -2.3,
        y: 0.45,
        z: 0.2,
        duration: 1.3,
        ease: 'power2.out',
      });

      // Chữ 01 xuất hiện bên phải
      const feat01 = document.querySelector('#feature-01') as HTMLElement;
      if (feat01) {
        const heading = feat01.querySelector('.feature-heading') as HTMLElement;
        const para = feat01.querySelector('.feature-para') as HTMLElement;
        const splitHeading = new SplitText(heading, { type: 'words' });
        const splitPara = new SplitText(para, { type: 'chars,words' });
        splitInstances.push(splitHeading, splitPara);

        tl.fromTo(
          feat01,
          { x: 80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '<+=0.3',
        );
        tl.fromTo(
          splitHeading.words,
          { opacity: 0.15, y: 15 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 },
          '<',
        );
        tl.fromTo(
          splitPara.chars,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.8 },
          '<+=0.2',
        );
      }

      tl.to({}, { duration: 0.8 });

      // Cả sân và chữ bay sang bên phải và biến mất
      tl.to(badmintonCourtRef.current!.position, {
        x: 26,
        y: 0.2,
        duration: 1.2,
        ease: 'power2.in',
      });
      tl.to(
        badmintonCourtRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 1.2 },
        '<',
      );
      tl.to(
        '#feature-01',
        { x: 220, opacity: 0, duration: 1.0, ease: 'power2.in' },
        '<',
      );
      tl.set(badmintonCourtRef.current!, { visible: false });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 4: TÍNH NĂNG 02 -> SÂN PICKLEBALL TRƯỢT TỪ PHẢI THEO GÓC NGHIÊNG 3D
      // ──────────────────────────────────────────────────────────────────────
      tl.set(pickleballCourtRef.current!, { visible: true });
      tl.set(pickleballCourtRef.current!.position, { x: 20, y: 0.45, z: 0.2 });
      tl.set(pickleballCourtRef.current!.rotation, {
        x: -0.72,
        y: -0.38,
        z: 0.22,
      });
      tl.set(pickleballCourtRef.current!.scale, { x: 0.9, y: 0.9, z: 0.9 });

      tl.to(pickleballCourtRef.current!.position, {
        x: 2.3,
        y: 0.45,
        z: 0.2,
        duration: 1.3,
        ease: 'power2.out',
      });

      // Chữ 02 xuất hiện bên trái
      const feat02 = document.querySelector('#feature-02') as HTMLElement;
      if (feat02) {
        const heading = feat02.querySelector('.feature-heading') as HTMLElement;
        const para = feat02.querySelector('.feature-para') as HTMLElement;
        const splitHeading = new SplitText(heading, { type: 'words' });
        const splitPara = new SplitText(para, { type: 'chars,words' });
        splitInstances.push(splitHeading, splitPara);

        tl.fromTo(
          feat02,
          { x: -80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '<+=0.3',
        );
        tl.fromTo(
          splitHeading.words,
          { opacity: 0.15, y: 15 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 },
          '<',
        );
        tl.fromTo(
          splitPara.chars,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.8 },
          '<+=0.2',
        );
      }

      tl.to({}, { duration: 0.8 });

      // Cả sân và chữ bay sang bên trái và biến mất
      tl.to(pickleballCourtRef.current!.position, {
        x: -26,
        y: 0.2,
        duration: 1.2,
        ease: 'power2.in',
      });
      tl.to(
        pickleballCourtRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 1.2 },
        '<',
      );
      tl.to(
        '#feature-02',
        { x: -220, opacity: 0, duration: 1.0, ease: 'power2.in' },
        '<',
      );
      tl.set(pickleballCourtRef.current!, { visible: false });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 5: TÍNH NĂNG 03 -> 2 CÂY VỢT DUAL RACKETS RA 2 BÊN, KHUNG Ở GIỮA
      // ──────────────────────────────────────────────────────────────────────
      tl.set(dualRacketsGroupRef.current!, { visible: true });
      tl.to(dualRacketsGroupRef.current!.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 0.3,
      });
      tl.to(
        dualBadmintonRef.current!.position,
        { x: -2.85, y: 0, z: 0, duration: 1.2, ease: 'back.out(1.2)' },
        '<',
      );
      tl.to(
        dualPickleballRef.current!.position,
        { x: 2.85, y: 0, z: 0, duration: 1.2, ease: 'back.out(1.2)' },
        '<',
      );
      tl.to(
        dualBadmintonRef.current!.rotation,
        { z: 0.18, y: 0.18, duration: 1.2 },
        '<',
      );
      tl.to(
        dualPickleballRef.current!.rotation,
        { z: -0.18, y: -0.18, duration: 1.2 },
        '<',
      );

      // Chữ 03 hiện ở chính giữa
      const feat03 = document.querySelector('#feature-03') as HTMLElement;
      if (feat03) {
        const heading = feat03.querySelector('.feature-heading') as HTMLElement;
        const para = feat03.querySelector('.feature-para') as HTMLElement;
        const splitHeading = new SplitText(heading, { type: 'words' });
        const splitPara = new SplitText(para, { type: 'chars,words' });
        splitInstances.push(splitHeading, splitPara);

        tl.fromTo(
          feat03,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '<+=0.3',
        );
        tl.fromTo(
          splitHeading.words,
          { opacity: 0.15, y: 15 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 },
          '<',
        );
        tl.fromTo(
          splitPara.chars,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, stagger: 0.012, duration: 0.8 },
          '<+=0.2',
        );
      }

      tl.to({}, { duration: 0.8 });

      // 2 cây vợt bay vút sang 2 bên và biến mất
      tl.to(dualBadmintonRef.current!.position, {
        x: -25.0,
        y: 15.0,
        duration: 1.1,
        ease: 'power2.in',
      });
      tl.to(dualBadmintonRef.current!.rotation, { z: 1.4, duration: 1.1 }, '<');
      tl.to(
        dualPickleballRef.current!.position,
        { x: 25.0, y: 15.0, duration: 1.1, ease: 'power2.in' },
        '<',
      );
      tl.to(
        dualPickleballRef.current!.rotation,
        { z: -1.4, duration: 1.1 },
        '<',
      );
      tl.to(
        '#feature-03',
        { scale: 0.9, opacity: 0, duration: 0.8, ease: 'power2.in' },
        '<',
      );
      tl.to(
        dualRacketsGroupRef.current!.scale,
        { x: 0, y: 0, z: 0, duration: 0.6 },
        '<+=0.4',
      );
      tl.set(dualRacketsGroupRef.current!, { visible: false });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 6: CTA -> NHÂN VẬT ANIME XUẤT HIỆN & BẢNG CTA HIỆN RA
      // ──────────────────────────────────────────────────────────────────────
      tl.set(animeCharacterRef.current!, { visible: true });
      tl.set(animeCharacterRef.current!.position, { x: -10, y: -0.9, z: 0.5 });
      tl.set(animeCharacterRef.current!.scale, { x: 1.25, y: 1.25, z: 1.25 });
      if (animeMouthNeutralRef.current) {
        tl.set(animeMouthNeutralRef.current.scale, { x: 1, y: 1, z: 1 });
      }
      if (animeMouthSmileRef.current) {
        tl.set(animeMouthSmileRef.current.scale, { x: 0, y: 0, z: 0 });
      }

      tl.to(animeCharacterRef.current!.position, {
        x: -2.3,
        y: -0.9,
        z: 0.5,
        duration: 1.4,
        ease: 'power2.out',
      });
      tl.to(
        animeCharacterRef.current!.rotation,
        { y: 0.35, duration: 1.4 },
        '<',
      );
      tl.to(
        animeHeadRef.current!.rotation,
        { y: 0.25, x: -0.05, duration: 1.4 },
        '<',
      );

      // Khung CTA hiện ra bên phải
      tl.to(
        '.story-cta',
        {
          opacity: 1,
          pointerEvents: 'auto',
          scale: 1,
          x: 0,
          y: 0,
          duration: 1.0,
          ease: 'back.out(1.2)',
        },
        '<+=0.3',
      );

      tl.to({}, { duration: 1.2 });

      // ──────────────────────────────────────────────────────────────────────
      // STEP 7: TIẾP TỤC LƯỚT XUỐNG:
      // - KHUNG CTA DOWN XUỐNG DƯỚI RỒI BIẾN MẤT
      // - NHÂN VẬT TIẾN VÀO GIỮA KHUNG HÌNH (KHÔNG BAY XUỐNG THEO)
      // - CHỈ ĐỔI MIỆNG SANG CƯỜI RẠNG RỠ VÀ CÚI ĐẦU NHÌN XUỐNG DƯỚI!
      // ──────────────────────────────────────────────────────────────────────
      // 1. Cái bảng kia down xuống
      tl.to('.story-cta', {
        opacity: 0,
        y: 350,
        scale: 0.95,
        pointerEvents: 'none',
        duration: 1.2,
        ease: 'power2.inOut',
      });

      // 2. Nhân vật di chuyển vào giữa khung hình (x: 0, không bay xuống theo)
      tl.to(
        animeCharacterRef.current!.position,
        {
          x: 0,
          y: -0.85,
          z: 0.7,
          duration: 1.3,
          ease: 'power2.inOut',
        },
        '<',
      );
      tl.to(
        animeCharacterRef.current!.rotation,
        { y: 0, duration: 1.3, ease: 'power2.inOut' },
        '<',
      );
      tl.to(
        animeCharacterRef.current!.scale,
        { x: 1.35, y: 1.35, z: 1.35, duration: 1.3, ease: 'power2.inOut' },
        '<',
      );

      // 3. Đầu cúi nhẹ nhìn xuống dưới
      tl.to(
        animeHeadRef.current!.rotation,
        { x: 0.38, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut' },
        '<',
      );

      // 4. Đổi miệng sang cười rạng rỡ
      if (animeMouthNeutralRef.current) {
        tl.to(
          animeMouthNeutralRef.current.scale,
          { x: 0, y: 0, z: 0, duration: 0.45, ease: 'power2.in' },
          '<+=0.15',
        );
      }
      if (animeMouthSmileRef.current) {
        tl.to(
          animeMouthSmileRef.current.scale,
          { x: 1, y: 1, z: 1, duration: 0.65, ease: 'back.out(1.8)' },
          '<+=0.15',
        );
      }
      if (animeBlushRef.current) {
        tl.to(
          animeBlushRef.current.scale,
          { x: 1.25, y: 1.25, z: 1.25, duration: 0.65, ease: 'back.out(1.5)' },
          '<',
        );
      }

      // Mũi tên dẫn hướng hiện ra bên dưới nhân vật
      tl.to('.story-scroll-indicator', { opacity: 1, duration: 0.6 }, '>-=0.4');

      // Giữ nhân vật đứng giữa khung hình, cười tươi nhìn xuống
      tl.to({}, { duration: 1.2 });
    });

    return () => {
      splitInstances.forEach((inst) => inst.revert());
      ctx.revert();
    };
  }, [isAuthenticated, refs]);
}
