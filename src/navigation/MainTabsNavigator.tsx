import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FeedScreen } from '@screens/feed/FeedScreen';
import { ThreadsScreen } from '@screens/messaging/ThreadsScreen';
import { MentorHomeScreen } from '@screens/mentor/MentorHomeScreen';
import { NotificationsScreen } from '@screens/notifications/NotificationsScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';

import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Messages" component={ThreadsScreen} />
      <Tab.Screen name="Mentor" component={MentorHomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
