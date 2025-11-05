import '@testing-library/jest-native/extend-expect';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => {
      const { children, ...rest } = props;
      return React.createElement(View, rest, children);
    },
  };
});
