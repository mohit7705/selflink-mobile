export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  SocialLogin: undefined;
};

export type OnboardingStackParamList = {
  PersonalMap: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabsParamList = {
  Feed: undefined;
  Messages: undefined;
  Mentor: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type FeedStackParamList = {
  FeedHome: undefined;
  PostDetails: { postId: number; post?: unknown } | undefined;
  CreatePost: undefined;
  SearchProfiles: undefined;
  UserProfile: { userId: number };
};

export type MessagesStackParamList = {
  Threads: undefined;
  Chat: { threadId: number; otherUserId?: number };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  SearchProfiles: undefined;
  UserProfile: { userId: number };
};

export type FeedStackParamList = {
  FeedHome: undefined;
  PostDetails: { postId: number; post?: any } | undefined;
  CreatePost: undefined;
  SearchProfiles: undefined;
  UserProfile: { userId: number };
};

export type MessagesStackParamList = {
  Threads: undefined;
  Chat: { threadId: number };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  SearchProfiles: undefined;
  UserProfile: { userId: number };
};
