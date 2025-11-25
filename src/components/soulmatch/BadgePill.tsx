import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@theme/index';

type Props = {
  label: string;
  tone?: 'default' | 'positive' | 'warning';
};

export function BadgePill({ label, tone = 'default' }: Props) {
  const background =
    tone === 'positive'
      ? theme.palette.glow
      : tone === 'warning'
        ? theme.palette.ember
        : theme.palette.titanium;
  const color = tone === 'default' ? theme.palette.pearl : theme.palette.midnight;
  return (
    <View style={[styles.pill, { backgroundColor: background }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
});
