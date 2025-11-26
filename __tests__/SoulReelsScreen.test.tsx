import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { SoulReelsScreen } from '@screens/video/SoulReelsScreen';

jest.mock('react-native-markdown-display', () => 'Markdown');

const mockFetchFirstPage = jest.fn().mockResolvedValue(undefined);
const mockFetchNextPage = jest.fn();
const mockSetMode = jest.fn();

const basePost = {
  id: 'r1',
  author: {
    id: 1,
    email: 'a@example.com',
    handle: 'a',
    name: 'Alice',
    bio: '',
    photo: '',
    birth_date: null,
    birth_time: null,
    birth_place: '',
    locale: 'en',
    flags: {},
    created_at: '',
    updated_at: '',
  },
  text: 'Reel text',
  visibility: 'public',
  language: 'en',
  media: [],
  video: { url: 'https://cdn.example.com/video.mp4' },
  like_count: 2,
  comment_count: 1,
  liked: false,
  created_at: '',
};

jest.mock('@store/videoFeedStore', () => ({
  useVideoFeedStore: (selector: any) =>
    selector({
      currentMode: 'for_you',
      itemsByMode: { for_you: [{ id: 'r1', post: basePost }], following: [] },
      nextByMode: { for_you: null, following: null },
      isLoadingByMode: { for_you: false, following: false },
      isPagingByMode: { for_you: false, following: false },
      errorByMode: { for_you: undefined, following: undefined },
      fetchFirstPage: mockFetchFirstPage,
      fetchNextPage: mockFetchNextPage,
      setMode: mockSetMode,
    }),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
  };
});

describe('SoulReelsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders first video reel and triggers initial fetch', () => {
    const { getByText, getByTestId } = render(<SoulReelsScreen />);

    expect(getByText('Reel text')).toBeTruthy();
    expect(getByTestId('video-post-player')).toBeTruthy();
    expect(mockFetchFirstPage).toHaveBeenCalled();
  });

  it('changes mode when tapping Following', () => {
    const { getByText } = render(<SoulReelsScreen />);
    fireEvent.press(getByText('Following'));
    expect(mockSetMode).toHaveBeenCalledWith('following');
  });
});
