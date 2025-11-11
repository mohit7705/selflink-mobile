import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { followUser, searchUsers, unfollowUser, UserSummary } from '@api/users';

export function SearchProfilesScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      const data = await searchUsers(query.trim());
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to search users.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.formRow}>
        <TextInput
          placeholder="Search profiles"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          autoCapitalize="none"
        />
        <Button title="Search" onPress={handleSearch} disabled={isLoading} />
      </View>
      {isLoading && <ActivityIndicator style={styles.loading} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
              <Text style={styles.resultName}>{item.name || item.handle || item.username}</Text>
              <Text style={styles.resultHandle}>@{item.handle || item.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.followButton}
              onPress={async () => {
                const next = !item.is_following;
                setResults((prev) =>
                  prev.map((user) =>
                    user.id === item.id ? { ...user, is_following: next } : user,
                  ),
                );
                try {
                  if (next) {
                    await followUser(item.id);
                  } else {
                    await unfollowUser(item.id);
                  }
                } catch (err) {
                  console.warn('SearchProfiles: follow toggle failed', err);
                  setResults((prev) =>
                    prev.map((user) =>
                      user.id === item.id ? { ...user, is_following: !next } : user,
                    ),
                  );
                }
              }}
            >
              <Text style={styles.followButtonText}>{item.is_following ? 'Unfollow' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading && results.length === 0 ? (
            <View style={styles.empty}> 
              <Text>No results</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loading: {
    marginBottom: 12,
  },
  error: {
    color: '#DC2626',
    marginBottom: 12,
  },
  resultRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultName: {
    fontWeight: '600',
  },
  resultHandle: {
    color: '#475569',
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followButtonText: {
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
});
