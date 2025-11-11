import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FeedScreen } from '@screens/feed/FeedScreen';
import { PostDetailsScreen } from '@screens/feed/PostDetailsScreen';
import { CreatePostScreen } from '@screens/feed/CreatePostScreen';
import { ThreadsScreen } from '@screens/messaging/ThreadsScreen';
import { ChatScreen } from '@screens/messaging/ChatScreen';
import { MentorHomeScreen } from '@screens/mentor/MentorHomeScreen';
import { NotificationsScreen } from '@screens/notifications/NotificationsScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { SearchProfilesScreen } from '@screens/profile/SearchProfilesScreen';
import { UserProfileScreen } from '@screens/profile/UserProfileScreen';

import type {
  MainTabsParamList,
  FeedStackParamList,
  MessagesStackParamList,
  ProfileStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name="FeedHome" component={FeedScreen} options={{ headerTitle: 'Feed' }} />
      <FeedStack.Screen name="PostDetails" component={PostDetailsScreen} options={{ title: 'Post' }} />
      <FeedStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post' }} />
      <FeedStack.Screen name="SearchProfiles" component={SearchProfilesScreen} options={{ title: 'Search Profiles' }} />
      <FeedStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
    </FeedStack.Navigator>
  );
}

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="Threads" component={ThreadsScreen} options={{ headerShown: false }} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} options={{ title: 'Messages' }} />
    </MessagesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="SearchProfiles" component={SearchProfilesScreen} options={{ title: 'Search Profiles' }} />
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

export function MainTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Feed" component={FeedStackNavigator} />
      <Tab.Screen name="Messages" component={MessagesStackNavigator} />
      <Tab.Screen name="Mentor" component={MentorHomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
