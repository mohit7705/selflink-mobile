import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { navigateToUserProfile } from '@navigation/helpers';
import { useAuthStore } from '@store/authStore';
import { useMessagingStore, type MessagingState } from '@store/messagingStore';
import type { Message } from '@schemas/messaging';

interface RouteParams {
  threadId: number;
  otherUserId?: number;
}

type ChatRoute = RouteProp<Record<'Chat', RouteParams>, 'Chat'>;

const EMPTY_MESSAGES: Message[] = [];

export function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ChatRoute>();
  const threadId = route.params.threadId;
  const otherUserId = route.params.otherUserId;
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const loadThreadMessages = useMessagingStore((state) => state.loadThreadMessages);
  const sendMessage = useMessagingStore((state) => state.sendMessage);
  const markThreadRead = useMessagingStore((state) => state.markThreadRead);
  const setActiveThread = useMessagingStore((state) => state.setActiveThread);
  const syncThreads = useMessagingStore((state) => state.syncThreads);
  const removeMessage = useMessagingStore((state) => state.removeMessage);
  const messagesSelector = useMemo(
    () => (state: MessagingState) => state.messagesByThread[String(threadId)],
    [threadId],
  );
  const messages = useMessagingStore(messagesSelector) ?? undefined;
  const isLoading = useMessagingStore((state) => state.isLoadingMessages);
  const currentUserId = useAuthStore((state) => state.currentUser?.id);

  useEffect(() => {
    loadThreadMessages(threadId).catch(() => undefined);
  }, [loadThreadMessages, threadId]);

  useLayoutEffect(() => {
    if (!otherUserId) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigateToUserProfile(navigation, otherUserId)}>
          <Text style={{ color: '#2563EB', fontWeight: '600' }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherUserId]);

  useFocusEffect(
    useCallback(() => {
      const key = String(threadId);
      setActiveThread(key);
      markThreadRead(threadId).catch(() => undefined);
      return () => {
        setActiveThread(null);
        syncThreads().catch(() => undefined);
      };
    }, [markThreadRead, setActiveThread, syncThreads, threadId]),
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) {
      return;
    }
    setIsSending(true);
    try {
      const payload = input.trim();
      if (__DEV__) {
        console.log('[ChatScreen] sendMessage', { threadId, preview: payload.slice(0, 32) });
      }
      await sendMessage(threadId, payload);
      setInput('');
    } catch (error: unknown) {
      console.warn('ChatScreen: failed to send message', error);
      const detail =
        typeof error === 'object' && error && 'response' in error
          ? (error as any).response?.data?.detail ?? ''
          : '';
      Alert.alert('Unable to send message', detail || 'Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sendMessage, threadId]);

  const threadMessages = useMemo(() => messages ?? EMPTY_MESSAGES, [messages]);

  const confirmDeleteMessage = useCallback(
    (message: Message) => {
      if (pendingDeleteId) {
        return;
      }
      Alert.alert('Delete message?', 'This removes the message for you only.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for me',
          style: 'destructive',
          onPress: () => {
            const key = String(message.id);
            setPendingDeleteId(key);
            removeMessage(threadId, message.id)
              .catch((error) => {
                console.warn('ChatScreen: delete message failed', error);
                Alert.alert('Unable to delete message', 'Please try again.');
              })
              .finally(() => {
                setPendingDeleteId((current) => (current === key ? null : current));
              });
          },
        },
      ]);
    },
    [pendingDeleteId, removeMessage, threadId],
  );

  if (isLoading && threadMessages.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={threadMessages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            currentUserId={currentUserId}
            onLongPress={confirmDeleteMessage}
            disableActions={Boolean(pendingDeleteId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        inverted
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          disabled={isSending}
        >
          <Text style={styles.sendButtonText}>{isSending ? 'Sending…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const MessageBubble = ({
  message,
  currentUserId,
  onLongPress,
  disableActions,
}: {
  message: Message;
  currentUserId?: number;
  onLongPress?: (message: Message) => void;
  disableActions?: boolean;
}) => {
  const isOwn = currentUserId === message.sender.id;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      delayLongPress={250}
      onLongPress={() => {
        if (!disableActions) {
          onLongPress?.(message);
        }
      }}
      style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
    >
      {!isOwn && <Text style={styles.sender}>{message.sender.name}</Text>}
      <Text>{message.body}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  composer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  sendButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  bubbleOwn: {
    backgroundColor: '#DBEAFE',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
  },
  sender: {
    fontWeight: '600',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
