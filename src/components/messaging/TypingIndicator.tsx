import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const DOT_BASE = 0.3;

export const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(DOT_BASE)).current;
  const dot2 = useRef(new Animated.Value(DOT_BASE)).current;
  const dot3 = useRef(new Animated.Value(DOT_BASE)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: DOT_BASE,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const animations = [animate(dot1, 0), animate(dot2, 150), animate(dot3, 300)];
    animations.forEach((animation) => animation.start());
    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: '#6B7280',
  },
});

export default TypingIndicator;
