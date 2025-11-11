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

import { searchUsers, UserSummary } from '@api/users';

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
          <TouchableOpacity
            style={styles.resultRow}
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          >
            <Text style={styles.resultName}>{item.name || item.handle}</Text>
            <Text style={styles.resultHandle}>@{item.handle}</Text>
          </TouchableOpacity>
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
  },
  resultName: {
    fontWeight: '600',
  },
  resultHandle: {
    color: '#475569',
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
