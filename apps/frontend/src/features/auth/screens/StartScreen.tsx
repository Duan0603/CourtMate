import React, { useState, useEffect, useRef } from 'react';
import { YStack, H1, Paragraph, View, Text } from 'tamagui';
import { Animated, StyleSheet, Easing, useWindowDimensions } from 'react-native';

const IMAGES = [
  'https://www.badmintonavenue.com/cdn/shop/files/badminton-grass-racket.webp?v=1707584672&width=1200',
  'https://contents.mediadecathlon.com/s1286564/k$0fa178d34a2c5c14e34e7173b0ba79cf/defaut.jpg?format=auto',
  'https://gameonfamily.com/cdn/shop/articles/Depositphotos_9388060_original.jpg?v=1739840875'
];

export const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fadeAnims = useRef(IMAGES.map(() => new Animated.Value(0))).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isSmallMobile = width <= 380;

  // Initial fade in for the first image
  useEffect(() => {
    fadeAnims[0].setValue(1);
  }, []);

  // Carousel logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % IMAGES.length;
        
        Animated.parallel([
          Animated.timing(fadeAnims[prev], {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnims[next], {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ]).start();
        
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto Shake and Pulse animation every 3s
  useEffect(() => {
    const runAnimations = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      ]).start();

      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]).start();
    };

    const interval = setInterval(runAnimations, 3000);
    // Initial run slightly delayed so user can see screen first
    setTimeout(runAnimations, 1000);

    return () => clearInterval(interval);
  }, []);

  const transformStyle = {
    transform: [
      { translateX: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] }) },
      { rotate: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] }) }
    ]
  };

  const pulseStyle = {
    transform: [
      { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }
    ],
    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })
  };

  return (
    <View flex={1} w="100%" h="100%" bg="#000">
      {IMAGES.map((img, index) => (
        <Animated.Image
          key={index}
          source={{ uri: img }}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnims[index] }]}
          resizeMode="cover"
        />
      ))}

      <View position="absolute" top={0} bottom={0} left={0} right={0} bg="rgba(0,0,0,0.65)" />

      <YStack ai="center" jc="center" p={isDesktop ? "$10" : "$6"} style={{ zIndex: 1 }} f={1} w="100%">
        <H1 color="#ffffff" fontWeight="900" fos={isDesktop ? 72 : (isSmallMobile ? 48 : 56)} lh={isDesktop ? 80 : (isSmallMobile ? 56 : 64)} ls={-1} ta="center" mb="$2">
          CourtMate
        </H1>
        <Paragraph color="rgba(255,255,255,0.85)" fos={isDesktop ? 20 : (isSmallMobile ? 16 : 18)} ta="center" mb={isDesktop ? "$12" : "$10"} maxWidth={isDesktop ? 480 : 360}>
          Ứng dụng tìm kiếm đối thủ và đặt sân thể thao nhanh chóng nhất.
        </Paragraph>

        {/* Start Button Container */}
        <Animated.View style={[{ width: '100%', maxWidth: isDesktop ? 420 : 360, alignItems: 'center', justifyContent: 'center' }, transformStyle]}>
          {/* Pulse Layer */}
          <Animated.View 
            style={[
              { position: 'absolute', width: '100%', height: isDesktop ? 80 : 72, borderRadius: 100, backgroundColor: '#C4F82A' },
              pulseStyle
            ]} 
          />
          
          {/* Actual Button */}
          <View
            focusable={true} cursor="pointer"
            bg="#C4F82A" h={isDesktop ? 80 : 72} br={100} px={isDesktop ? "$12" : "$10"} w="100%" jc="center" ai="center"
            onPress={onStart}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
            hoverStyle={{ scale: 1.05 }}
            animation="bouncy"
          >
            <Text color="#000000" fow="900" fos={isDesktop ? 22 : 20} tt="uppercase" ls={1}>Bắt đầu ngay</Text>
          </View>
        </Animated.View>
      </YStack>
    </View>
  );
};

export default StartScreen;
