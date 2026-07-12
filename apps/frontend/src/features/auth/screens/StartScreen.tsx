import React, { useEffect, useRef } from 'react';
import { YStack, XStack, H1, H2, Paragraph, View, Text, ScrollView } from 'tamagui';
import { useWindowDimensions, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Users, Calendar, ChevronDown, Play, Sparkles, Trophy, Activity } from 'lucide-react-native';
import gsap from 'gsap';

const EMOJIS = [
  { char: '⚽', top: '12%', left: '8%', size: 36 },
  { char: '🏀', top: '22%', right: '10%', size: 40 },
  { char: '🎾', top: '38%', left: '15%', size: 32 },
  { char: '🏸', top: '48%', right: '8%', size: 38 },
  { char: '🏓', top: '68%', left: '10%', size: 34 },
  { char: '🏆', top: '78%', right: '14%', size: 44 },
  { char: '👟', top: '60%', right: '22%', size: 32 },
  { char: '🥇', top: '88%', left: '16%', size: 36 },
];

// 1. Custom Tennis Racket Component
const TennisRacket = () => {
  return (
    <View style={{ width: 240, height: 480, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Racket Head */}
      <View
        w={210}
        h={260}
        br={105}
        borderWidth={10}
        borderColor="#1d4ed8"
        bg="rgba(29, 78, 216, 0.08)"
        style={{
          shadowColor: '#1d4ed8',
          shadowOpacity: 0.5,
          shadowRadius: 25,
          elevation: 5,
        }}
      >
        {/* Strings Grid */}
        <View position="absolute" top={0} left={0} right={0} bottom={0} br={105} overflow="hidden">
          <XStack w="100%" h="100%" jc="space-around" px="$4" opacity={0.25}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={`v-${i}`} w={1.2} h="100%" bg="#ffffff" />
            ))}
          </XStack>
          <YStack w="100%" h="100%" jc="space-around" py="$4" position="absolute" top={0} left={0} opacity={0.25}>
            {Array.from({ length: 11 }).map((_, i) => (
              <View key={`h-${i}`} h={1.2} w="100%" bg="#ffffff" />
            ))}
          </YStack>
        </View>
      </View>

      {/* Racket Throat */}
      <View
        w={56}
        h={48}
        borderLeftWidth={8}
        borderRightWidth={8}
        borderBottomWidth={8}
        borderColor="#1d4ed8"
        bg="transparent"
        mt={-5}
        style={{
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />

      {/* Racket Handle */}
      <View
        w={24}
        h={180}
        bg="#ffffff"
        borderWidth={2}
        borderColor="#1e293b"
        style={{
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 3
        }}
      >
        <YStack w="100%" h="100%" jc="space-between" py="$3" opacity={0.2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`g-${i}`} h={2.5} w="100%" bg="#7c747a" style={{ transform: [{ rotate: '-15deg' }] }} />
          ))}
        </YStack>
      </View>
    </View>
  );
};

// 2. Custom Badminton Racket Component
const BadmintonRacket = () => {
  return (
    <View style={{ width: 240, height: 480, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Elongated Head */}
      <View
        w={155}
        h={210}
        br={77}
        borderWidth={6}
        borderColor="#fcf8fa"
        bg="rgba(255,255,255,0.06)"
        style={{
          shadowColor: '#ffffff',
          shadowOpacity: 0.45,
          shadowRadius: 20,
          elevation: 4
        }}
      >
        {/* Thin Strings Grid */}
        <View position="absolute" top={0} left={0} right={0} bottom={0} br={77} overflow="hidden">
          <XStack w="100%" h="100%" jc="space-around" px="$2" opacity={0.2}>
            {Array.from({ length: 11 }).map((_, i) => (
              <View key={`v-${i}`} w={0.8} h="100%" bg="#ffffff" />
            ))}
          </XStack>
          <YStack w="100%" h="100%" jc="space-around" py="$2" position="absolute" top={0} left={0} opacity={0.2}>
            {Array.from({ length: 13 }).map((_, i) => (
              <View key={`h-${i}`} h={0.8} w="100%" bg="#ffffff" />
            ))}
          </YStack>
        </View>
      </View>

      {/* Long Thin Shaft */}
      <View w={5} h={180} bg="#fcf8fa" mt={-2} />

      {/* Grip Handle */}
      <View
        w={20}
        h={90}
        bg="#1e293b"
        borderWidth={1.5}
        borderColor="#7c747a"
        style={{
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3
        }}
      />
    </View>
  );
};

// 3. Custom Ping Pong Paddle Component
const PingPongPaddle = () => {
  return (
    <View style={{ width: 240, height: 480, alignItems: 'center', justifyContent: 'center' }}>
      <YStack ai="center" jc="flex-start" h={340}>
        {/* Circular Blade Head */}
        <View
          w={160}
          h={170}
          br={80}
          bg="#b3261e"
          borderWidth={6}
          borderColor="#dcd9db"
          style={{
            shadowColor: '#b3261e',
            shadowOpacity: 0.5,
            shadowRadius: 25,
            elevation: 5
          }}
        >
          <View
            position="absolute"
            top="30%"
            left="30%"
            w={60}
            h={60}
            br={30}
            borderWidth={1.5}
            borderColor="rgba(255,255,255,0.15)"
            jc="center"
            ai="center"
          >
            <Text color="rgba(255,255,255,0.2)" fos={10} fow="900">ITTF</Text>
          </View>
        </View>

        {/* Flared Handle */}
        <View
          w={26}
          h={90}
          bg="#dcd9db"
          mt={-5}
          style={{
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderWidth: 1.5,
            borderColor: '#7c747a',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 2
          }}
        >
          <XStack w="100%" h="100%" jc="space-around" px="$1">
            <View w={2} h="100%" bg="#b3261e" opacity={0.3} />
            <View w={2} h="100%" bg="#1e293b" opacity={0.3} />
          </XStack>
        </View>
      </YStack>
    </View>
  );
};

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { width, height: viewportHeight } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Refs for elements
  const heroRef = useRef<any>(null);
  const arrowRef = useRef<any>(null);
  const emojiRefs = useRef<any[]>([]);

  // 3D Tennis Racket Ref
  const cardContainerRef = useRef<any>(null);
  const racketRef = useRef<any>(null);
  const shadowRef = useRef<any>(null);

  // Cross-fading sub elements refs
  const tennisRef = useRef<any>(null);
  const badmintonRef = useRef<any>(null);
  const pingpongRef = useRef<any>(null);

  // Content layers refs
  const face1Ref = useRef<any>(null);
  const face2Ref = useRef<any>(null);
  const face3Ref = useRef<any>(null);
  const face4Ref = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Bounce arrow indicator
      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          y: 12,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          ease: 'power1.inOut'
        });
      }

      // Float sports emojis
      emojiRefs.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            x: 'random(-25, 25)',
            y: 'random(-35, 35)',
            rotation: 'random(-30, 30)',
            duration: 'random(4, 7)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.15
          });
        }
      });
    }
  }, []);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    if (Platform.OS === 'web') {
      // 1. Hero scroll-fade out (0 to 30% of viewport)
      const heroStart = 0;
      const heroEnd = viewportHeight * 0.3;
      if (heroRef.current) {
        if (scrollY <= heroStart) {
          gsap.set(heroRef.current, { opacity: 1, y: 0 });
        } else if (scrollY >= heroEnd) {
          gsap.set(heroRef.current, { opacity: 0, y: -50 });
        } else {
          const progress = (scrollY - heroStart) / (heroEnd - heroStart);
          gsap.set(heroRef.current, { opacity: 1 - progress, y: -progress * 50 });
        }
      }

      // 2. Sports equipment scroll scrubbing
      // Pushed startScroll down to 0.5x viewport height, so it only starts showing up when close to center
      const startScroll = viewportHeight * 0.5;
      const endScroll = viewportHeight * 3.5; 
      
      if (racketRef.current) {
        if (scrollY <= startScroll) {
          // Starting center position
          gsap.set(racketRef.current, { x: 0, y: 0, rotate: 0, rotateY: 0, scale: 1, opacity: 0 });
          gsap.set(shadowRef.current, { x: 0, y: 220, scale: 1, opacity: 0 });
          gsap.set(tennisRef.current, { opacity: 1 });
          gsap.set(badmintonRef.current, { opacity: 0 });
          gsap.set(pingpongRef.current, { opacity: 0 });
          gsap.set(face1Ref.current, { opacity: 0, y: 20 });
          gsap.set(face2Ref.current, { opacity: 0, y: 20 });
          gsap.set(face3Ref.current, { opacity: 0, y: 20 });
          gsap.set(face4Ref.current, { opacity: 0, scale: 0.95 });
        } else if (scrollY >= endScroll) {
          // CTA Final center position
          gsap.set(racketRef.current, { x: 0, y: 0, rotate: 180, rotateY: 720, scale: 0.55, opacity: 0.12 });
          gsap.set(shadowRef.current, { x: 0, y: 120, scale: 0.55, opacity: 0.05 });
          gsap.set(tennisRef.current, { opacity: 0 });
          gsap.set(badmintonRef.current, { opacity: 0 });
          gsap.set(pingpongRef.current, { opacity: 0 });
          gsap.set(face1Ref.current, { opacity: 0 });
          gsap.set(face2Ref.current, { opacity: 0 });
          gsap.set(face3Ref.current, { opacity: 0 });
          gsap.set(face4Ref.current, { opacity: 1, scale: 1 });
        } else {
          const progress = (scrollY - startScroll) / (endScroll - startScroll);
          
          let racketX = 0;
          let racketY = 0;
          let racketRot = 0;
          let racketRotY = 0;
          let racketScale = 1;
          let racketOp = 1;

          let f1Op = 0;
          let f2Op = 0;
          let f3Op = 0;
          let f4Op = 0;

          // Cross-fading opacity of rackets
          let tOp = 0;
          let bOp = 0;
          let pOp = 0;

          // Coordinates to shift racket to side
          const destX = isDesktop ? width * 0.22 : 0;
          const destY = isDesktop ? 0 : -viewportHeight * 0.22;

          // Symmetrical partition layout for perfect synchronization:
          // - 0.00 -> 0.10: Plateau 1 (Feature 1 - Tennis) - Racket shifted to left
          // - 0.10 -> 0.30: Transition 1 (Flip and morph to Badminton on right)
          // - 0.30 -> 0.40: Plateau 2 (Feature 2 - Badminton) - Racket shifted to right
          // - 0.40 -> 0.60: Transition 2 (Flip and morph to Ping Pong on left)
          // - 0.60 -> 0.70: Plateau 3 (Feature 3 - Ping Pong) - Racket shifted to left
          // - 0.70 -> 0.90: Transition 3 (Flip and center to reveal CTA)
          // - 0.90 -> 1.00: Plateau 4 (CTA - Register) - faded in center
          if (progress <= 0.10) {
            racketX = -destX;
            racketY = destY;
            racketRot = -12;
            racketRotY = 0;
            racketScale = 0.9;
            f1Op = 1;
            tOp = 1; bOp = 0; pOp = 0;
          } else if (progress > 0.10 && progress <= 0.30) {
            const p = (progress - 0.10) / 0.20;
            racketX = -destX + p * (destX * 2);
            racketY = destY - p * (destY * 2);
            racketRot = -12 + p * 24; // -12 to 12
            racketRotY = p * 180;
            racketScale = 0.9;
            f1Op = 1 - p;
            f2Op = p;
            tOp = 1 - p;
            bOp = p;
            pOp = 0;
          } else if (progress > 0.30 && progress <= 0.40) {
            racketX = destX;
            racketY = -destY;
            racketRot = 12;
            racketRotY = 180;
            racketScale = 0.9;
            f2Op = 1;
            tOp = 0; bOp = 1; pOp = 0;
          } else if (progress > 0.40 && progress <= 0.60) {
            const p = (progress - 0.40) / 0.20;
            racketX = destX - p * (destX * 2);
            racketY = -destY + p * (destY * 2);
            racketRot = 12 - p * 24; // 12 to -12
            racketRotY = 180 + p * 180;
            racketScale = 0.9;
            f2Op = 1 - p;
            f3Op = p;
            tOp = 0;
            bOp = 1 - p;
            pOp = p;
          } else if (progress > 0.60 && progress <= 0.70) {
            racketX = -destX;
            racketY = destY;
            racketRot = -12;
            racketRotY = 360;
            racketScale = 0.9;
            f3Op = 1;
            tOp = 0; bOp = 0; pOp = 1;
          } else if (progress > 0.70 && progress <= 0.90) {
            const p = (progress - 0.70) / 0.20;
            racketX = -destX + p * destX;
            racketY = destY - p * destY;
            racketRot = -12 + p * 12;
            racketRotY = 360 + p * 180;
            racketScale = 0.9 - p * 0.3;
            racketOp = 1 - p * 0.85;
            f3Op = 1 - p;
            f4Op = p;
            tOp = 0; bOp = 0; pOp = 1 - p;
          } else {
            racketX = 0;
            racketY = 0;
            racketRot = 0;
            racketRotY = 540;
            racketScale = 0.6;
            racketOp = 0.15;
            f4Op = 1;
            tOp = 0; bOp = 0; pOp = 0;
          }

          // Slow down fade-in opacity of elements at the start
          const opacityVal = Math.min(progress / 0.08, 1);

          gsap.set(racketRef.current, {
            x: racketX,
            y: racketY,
            rotate: racketRot,
            rotateY: racketRotY,
            scale: racketScale,
            opacity: racketOp * opacityVal
          });

          // Animate floor shadow beneath it
          gsap.set(shadowRef.current, {
            x: racketX,
            y: racketY + (isDesktop ? 220 : 160),
            scale: racketScale,
            opacity: racketOp * opacityVal * 0.55
          });

          // Cross-fade the actual sports gear opacities
          gsap.set(tennisRef.current, { opacity: tOp });
          gsap.set(badmintonRef.current, { opacity: bOp });
          gsap.set(pingpongRef.current, { opacity: pOp });

          gsap.set(face1Ref.current, { opacity: f1Op, y: (1 - f1Op) * 20 });
          gsap.set(face2Ref.current, { opacity: f2Op, y: (1 - f2Op) * 20 });
          gsap.set(face3Ref.current, { opacity: f3Op, y: (1 - f3Op) * 20 });
          gsap.set(face4Ref.current, { opacity: f4Op, scale: 0.95 + f4Op * 0.05 });
        }
      }
    }
  };

  return (
    <View flex={1} bg="#1e293b" w="100%" h="100%">
      {/* Background Gradients */}
      <View position="absolute" top={0} left={0} right={0} bottom={0} style={{ zIndex: 0 }} pointerEvents="none">
        <View style={[styles.gradientOrb, { top: '-10%', left: '-20%', backgroundColor: 'rgba(29, 78, 216, 0.15)' }]} />
        <View style={[styles.gradientOrb, { bottom: '20%', right: '-20%', backgroundColor: 'rgba(30, 41, 59, 0.4)' }]} />
      </View>

      {/* Floating Emojis */}
      {Platform.OS === 'web' && EMOJIS.map((item, index) => (
        <View
          key={index}
          ref={(el) => (emojiRefs.current[index] = el)}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            right: item.right,
            opacity: 0.22,
            zIndex: 1,
            userSelect: 'none',
            pointerEvents: 'none'
          } as any}
        >
          <Text style={{ fontSize: item.size }}>{item.char}</Text>
        </View>
      ))}

      <ScrollView
        flex={1}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 2 }}
      >
        {/* Section 1: Hero Section */}
        <YStack
          h={viewportHeight}
          jc="center"
          ai="center"
          px="$5"
          position="relative"
        >
          <YStack ref={heroRef} ai="center" gap="$3" maxWidth={600}>
            {/* Tag Badge */}
            <XStack bg="rgba(29, 78, 216, 0.1)" px="$3" py="$1.5" br="$10" ai="center" gap="$1.5" borderWidth={1} borderColor="rgba(29, 78, 216, 0.2)">
              <Sparkles size={14} color="#1d4ed8" />
              <Text color="#ffffff" fos={12} fow="700" tt="uppercase" ls={1}>Chào mừng tới CourtMate</Text>
            </XStack>

            <H1
              color="#ffffff"
              fontWeight="900"
              fos={isDesktop ? 76 : 52}
              lh={isDesktop ? 84 : 60}
              ls={-1.5}
              ta="center"
              mt="$2"
            >
              CourtMate
            </H1>
            
            <Paragraph
              color="rgba(255, 255, 255, 0.75)"
              fos={isDesktop ? 20 : 16}
              lh={isDesktop ? 30 : 24}
              ta="center"
              mt="$3"
            >
              Ứng dụng tìm kiếm đối thủ và đặt sân thể thao nhanh chóng nhất.
            </Paragraph>
          </YStack>

          {/* Scroll Down Guide */}
          <YStack
            ref={arrowRef}
            position="absolute"
            bottom={isDesktop ? 50 : 30}
            ai="center"
            gap="$2"
            opacity={0.8}
          >
            <Text color="rgba(255,255,255,0.6)" fos={12} fow="600" tt="uppercase" ls={1}>Cuộn chuột để khám phá</Text>
            <ChevronDown color="#ffffff" size={24} />
          </YStack>
        </YStack>

        {/* Section 2: Sticky Storytelling Container */}
        <View
          ref={cardContainerRef}
          style={{
            position: Platform.OS === 'web' ? 'sticky' : 'relative',
            top: 0,
            height: viewportHeight * 4.2, 
            paddingHorizontal: 20,
            zIndex: 10
          } as any}
        >
          {/* Sticky wrapper centered at 20% viewport */}
          <View
            style={{
              position: Platform.OS === 'web' ? 'sticky' : 'relative',
              top: isDesktop ? '20%' : '15%', 
              width: '100%',
              maxWidth: 1200, 
              height: 520,  
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            } as any}
          >
            {/* Floor shadow beneath equipment for realistic depth */}
            <View
              ref={shadowRef}
              style={{
                position: 'absolute',
                width: 140,
                height: 18,
                borderRadius: 9,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                opacity: 0,
                // Web-specific blur filter for premium shadow rendering
                ...Platform.select({
                  web: { filter: 'blur(12px)' as any },
                  default: {}
                })
              }}
            />

            {/* Rotating container containing all sports gear */}
            <View
              ref={racketRef}
              style={{
                width: 240,
                height: 480,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                opacity: Platform.OS === 'web' ? 0 : 1,
              } as any}
            >
              {/* Tennis Racket for Matchmaking */}
              <View ref={tennisRef} style={{ position: 'absolute', top: 0, opacity: 1 }}>
                <TennisRacket />
              </View>

              {/* Badminton Racket for Booking */}
              <View ref={badmintonRef} style={{ position: 'absolute', top: 0, opacity: 0 }}>
                <BadmintonRacket />
              </View>

              {/* Ping Pong Paddle for Tournaments */}
              <View ref={pingpongRef} style={{ position: 'absolute', top: 70, opacity: 0 }}>
                <PingPongPaddle />
              </View>
            </View>

            {/* STAGE 1: Feature 1 (Matchmaking) on the right side */}
            <YStack
              ref={face1Ref}
              style={{
                position: 'absolute',
                right: isDesktop ? '5%' : 'auto',
                top: isDesktop ? 'auto' : '52%',
                width: isDesktop ? '45%' : '100%',
                opacity: 0,
                justifyContent: 'center',
              } as any}
            >
              <XStack gap="$4" ai="center" mb="$3" jc={isDesktop ? 'flex-start' : 'center'}>
                <View
                  w={72}
                  h={72}
                  br={36}
                  bg="rgba(29, 78, 216, 0.15)"
                  jc="center"
                  ai="center"
                  borderWidth={2}
                  borderColor="#1d4ed8"
                >
                  <Users color="#ffffff" size={32} />
                </View>
                <H2 color="#ffffff" fos={isDesktop ? 36 : 24} fow="900" ta={isDesktop ? 'left' : 'center'}>
                  Tìm bạn chơi (Grab-like)
                </H2>
              </XStack>
              <Paragraph color="rgba(255, 255, 255, 0.85)" fos={isDesktop ? 18 : 15} lh={28} ta={isDesktop ? 'left' : 'center'}>
                Bạn muốn chơi thể thao nhưng thiếu đồng đội hoặc đối thủ xứng tầm? Hệ thống mai mối thông minh của CourtMate cho phép bạn tạo yêu cầu tìm bạn chơi tức thì. Người chơi xung quanh có cùng trình độ sẽ nhận được thông báo để tham gia so tài cùng bạn ngay lập tức!
              </Paragraph>
            </YStack>

            {/* STAGE 2: Feature 2 (Booking) on the left side */}
            <YStack
              ref={face2Ref}
              style={{
                position: 'absolute',
                left: isDesktop ? '5%' : 'auto',
                top: isDesktop ? 'auto' : '52%',
                width: isDesktop ? '45%' : '100%',
                opacity: 0,
                justifyContent: 'center',
              } as any}
            >
              <XStack gap="$4" ai="center" mb="$3" jc={isDesktop ? 'flex-start' : 'center'}>
                <View
                  w={72}
                  h={72}
                  br={36}
                  bg="rgba(29, 78, 216, 0.15)"
                  jc="center"
                  ai="center"
                  borderWidth={2}
                  borderColor="#1d4ed8"
                >
                  <Calendar color="#ffffff" size={32} />
                </View>
                <H2 color="#ffffff" fos={isDesktop ? 36 : 24} fow="900" ta={isDesktop ? 'left' : 'center'}>
                  Đặt sân trực tuyến 24/7
                </H2>
              </XStack>
              <Paragraph color="rgba(255, 255, 255, 0.85)" fos={isDesktop ? 18 : 15} lh={28} ta={isDesktop ? 'left' : 'center'}>
                Không cần liên hệ đặt sân thủ công qua điện thoại phiền hà. Với danh sách đối tác sân thể thao rộng khắp, CourtMate giúp bạn theo dõi lịch trống của tất cả các sân trong thời gian thực, tiến hành giữ chỗ và thanh toán lệ phí an toàn chỉ trong 30 giây.
              </Paragraph>
            </YStack>

            {/* STAGE 3: Feature 3 (Tournaments) on the right side */}
            <YStack
              ref={face3Ref}
              style={{
                position: 'absolute',
                right: isDesktop ? '5%' : 'auto',
                top: isDesktop ? 'auto' : '52%',
                width: isDesktop ? '45%' : '100%',
                opacity: 0,
                justifyContent: 'center',
              } as any}
            >
              <XStack gap="$4" ai="center" mb="$3" jc={isDesktop ? 'flex-start' : 'center'}>
                <View
                  w={72}
                  h={72}
                  br={36}
                  bg="rgba(29, 78, 216, 0.15)"
                  jc="center"
                  ai="center"
                  borderWidth={2}
                  borderColor="#1d4ed8"
                >
                  <Trophy color="#ffffff" size={32} />
                </View>
                <H2 color="#ffffff" fos={isDesktop ? 36 : 24} fow="900" ta={isDesktop ? 'left' : 'center'}>
                  Giải đấu kịch tính
                </H2>
              </XStack>
              <Paragraph color="rgba(255, 255, 255, 0.85)" fos={isDesktop ? 18 : 15} lh={28} ta={isDesktop ? 'left' : 'center'}>
                Tìm kiếm và đăng ký tham gia các giải đấu thể thao phong trào lớn nhỏ được tổ chức chuyên nghiệp. Theo dõi diễn biến giải đấu, bảng xếp hạng và cập nhật kết quả thi đấu nhanh chóng theo thời gian thực ngay trên ứng dụng CourtMate.
              </Paragraph>
            </YStack>

            {/* STAGE 4: Final CTA (Register) centered */}
            <YStack
              ref={face4Ref}
              style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 750,
                opacity: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
                borderRadius: 24,
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                padding: isDesktop ? 48 : 28,
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
              } as any}
            >
              <View
                w={80}
                h={80}
                br={40}
                bg="rgba(29, 78, 216, 0.18)"
                jc="center"
                ai="center"
                mb="$3"
                borderWidth={2}
                borderColor="#1d4ed8"
              >
                <Activity color="#ffffff" size={36} />
              </View>

              <H2 color="#ffffff" fos={isDesktop ? 38 : 28} fow="900" ta="center">
                Bắt đầu ngay hôm nay
              </H2>
              
              <Paragraph color="rgba(255, 255, 255, 0.65)" fos={16} ta="center" mt="$3" mb="$6" maxWidth={560}>
                Đăng ký tài khoản CourtMate để trải nghiệm tính năng tìm đối thủ, đặt lịch sân đấu và đăng ký giải đấu tức thì ngay bây giờ.
              </Paragraph>

              <TouchableOpacity
                onPress={onStart}
                activeOpacity={0.85}
                style={{ width: '100%', maxWidth: 360 }}
              >
                <XStack
                  bg="#1d4ed8"
                  h={60}
                  br={30}
                  jc="center"
                  ai="center"
                  gap="$3"
                  style={{
                    shadowColor: '#1d4ed8',
                    shadowOpacity: 0.45,
                    shadowRadius: 15,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6
                  }}
                >
                  <Text color="#ffffff" fow="800" fos={18} tt="uppercase" ls={1.2}>
                    Đăng ký ngay
                  </Text>
                  <Play color="#ffffff" size={18} fill="#ffffff" />
                </XStack>
              </TouchableOpacity>
            </YStack>

          </View>
        </View>

        {/* Small spacer at the very bottom */}
        <View h={60} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientOrb: Platform.select({
    web: {
      position: 'absolute',
      width: 600,
      height: 600,
      borderRadius: 300,
      filter: 'blur(100px)'
    },
    default: {
      position: 'absolute',
      width: 600,
      height: 600,
      borderRadius: 300,
      opacity: 0.15
    }
  }) as any
});

export default StartScreen;
