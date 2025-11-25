import { SoulmatchComponents, SoulmatchResult } from '@schemas/soulmatch';

const badgeFromComponents = (components: SoulmatchComponents | undefined) => {
  const badges: string[] = [];
  if ((components?.astro ?? 0) >= 80) {
    badges.push('Cosmic sync');
  }
  if ((components?.matrix ?? 0) >= 80) {
    badges.push('Life path aligned');
  }
  if ((components?.psychology ?? 0) >= 80) {
    badges.push('Emotional harmony');
  }
  if ((components?.lifestyle ?? 0) >= 80) {
    badges.push('Aligned habits');
  }
  if (
    badges.length === 0 &&
    (components?.astro ?? 0) + (components?.matrix ?? 0) > 140
  ) {
    badges.push('Balanced duo');
  }
  return badges;
};

export const buildBadges = (result: SoulmatchResult, limit = 3): string[] => {
  const tags = result.tags ?? [];
  const componentBadges = badgeFromComponents(result.components || {});
  const combined = [...componentBadges, ...tags];
  return combined.slice(0, limit);
};

export const formatScore = (score: number) => `${Math.round(score)}%`;

export const scoreTone = (score: number) => {
  if (score >= 80) return 'positive';
  if (score >= 60) return 'default';
  return 'warning';
};
