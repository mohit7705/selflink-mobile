export function navigateToUserProfile(
  navigation: { navigate: (routeName: string, params?: unknown) => void },
  userId: number | string,
) {
  navigation.navigate(
    'Profile' as never,
    {
      screen: 'UserProfile',
      params: { userId },
    } as never,
  );
}
