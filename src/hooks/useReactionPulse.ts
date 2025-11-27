import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useReactionPulse(triggerKey: string | number) {
  const scale = useRef(new Animated.Value(1)).current;
  const lastTriggerRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (lastTriggerRef.current === triggerKey) {
      return;
    }
    lastTriggerRef.current = triggerKey;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, triggerKey]);

  return {
    animatedStyle: {
      transform: [{ scale }],
    },
  };
}
