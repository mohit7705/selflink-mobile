import { render } from '@testing-library/react-native';

import { HomeScreen } from '@screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders the call to action buttons', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Mentor Session')).toBeTruthy();
    expect(getByText('SoulMatch')).toBeTruthy();
    expect(getByText('Payments')).toBeTruthy();
  });
});
