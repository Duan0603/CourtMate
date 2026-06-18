import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  cancelAnimation
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface MatchRadarProps {
  size?: number;
}

function RadarRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = 0.2;
    opacity.value = 0.8;

    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.2, { duration: 3000 }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 3000 }),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.ring, rStyle]} />;
}

export default function MatchRadar({ size = 150 }: MatchRadarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Three staggered rings */}
      <RadarRing delay={0} />
      <RadarRing delay={1000} />
      <RadarRing delay={2000} />

      {/* Solid center dot representing user */}
      <View style={styles.centerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    pointerEvents: 'none',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.dark.accent,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
});
