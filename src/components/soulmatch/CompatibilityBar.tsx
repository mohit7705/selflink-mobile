import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { theme } from '@theme/index';

type Props = {
  value: number;
  label?: string;
  size?: 'sm' | 'md';
};

const clampValue = (val: number) => Math.max(0, Math.min(100, val));

export function CompatibilityBar({ value, label, size = 'md' }: Props) {
  const animated = useRef(new Animated.Value(0)).current;
  const height = size === 'sm' ? 8 : 12;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clampValue(value),
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [animated, value]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fillWrapper, { width }]}>
          <LinearGradient
            colors={theme.gradients.matrix}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, { height }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
    flex: 1,
  },
  label: {
    color: theme.palette.platinum,
    ...theme.typography.caption,
  },
  track: {
    width: '100%',
    backgroundColor: theme.palette.titanium,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  fillWrapper: {
    height: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
});
