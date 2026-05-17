import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import friendsService from '../../services/friends.service';
import { FriendUser, FriendshipStatus } from '../../types';

const statusLabel = (s: FriendshipStatus): string => {
  switch (s) {
    case 'friends':
      return 'Friends';
    case 'requested':
      return 'Requested';
    case 'pending':
      return 'Accept';
    default:
      return '+';
  }
};

export const FriendsSearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await friendsService.search(q);
      if (res.success && Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (user: FriendUser) => {
    setBusyId(user.id);
    try {
      const res = await friendsService.sendRequest(user.id);
      if (res.success && res.data) {
        const newStatus: FriendshipStatus =
          res.data.status === 'friends' ? 'friends' : 'requested';
        setResults((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, friendship_status: newStatus } : u))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const renderItem = ({ item }: { item: FriendUser }) => {
    const status = item.friendship_status;
    const isDisabled = status === 'friends' || status === 'requested' || busyId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarEmoji}>{item.avatar || '👤'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={styles.cefr}>Level {item.cefr_level}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            status === 'friends' && styles.addButtonFriends,
            status === 'requested' && styles.addButtonRequested,
          ]}
          onPress={() => handleAdd(item)}
          disabled={isDisabled}
        >
          {busyId === item.id ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.addButtonText}>{statusLabel(status)}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Friends</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search by username"
          placeholderTextColor="#9AA3B2"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query.trim() ? 'No users found.' : 'Search for friends by username.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#222' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchButtonText: { color: '#FFF', fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#D6E4FF',
  },
  avatarEmoji: { fontSize: 22, lineHeight: 26 },
  userInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: '600', color: '#222' },
  cefr: { fontSize: 12, color: '#666', marginTop: 2 },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonFriends: { backgroundColor: '#9AA3B2', width: 'auto', paddingHorizontal: 12, borderRadius: 16, height: 32 },
  addButtonRequested: { backgroundColor: '#CBD3E0', width: 'auto', paddingHorizontal: 12, borderRadius: 16, height: 32 },
  addButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#666' },
});
