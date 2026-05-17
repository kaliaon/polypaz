import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import progressService from '../../services/progress.service';

interface GamificationProfile {
  username: string;
  cefr_level: string;
  total_xp: number;
  avatar: string;
}

type LeaderboardTab = 'global' | 'friends';

export const LeaderboardScreen: React.FC = () => {
  const [tab, setTab] = useState<LeaderboardTab>('global');
  const [leaderboard, setLeaderboard] = useState<GamificationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (which: LeaderboardTab) => {
    try {
      setError(null);
      const response =
        which === 'friends'
          ? await progressService.getFriendsLeaderboard()
          : await progressService.getLeaderboard();

      if (response.success && response.data) {
        // Ensure we extract the array if the backend wrapped it in a pagination object
        const responseData = response.data as any;
        const actualData = responseData.results ? responseData.results : responseData;

        if (Array.isArray(actualData)) {
          setLeaderboard(actualData);
        } else {
          setLeaderboard([]);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to fetch leaderboard');
      }
    } catch (e) {
      setError('Failed to load leaderboard. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(tab);
  }, [tab, fetchLeaderboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard(tab);
  };

  const renderItem = ({ item, index }: { item: GamificationProfile; index: number }) => {
    const isTop3 = index < 3;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
    const rankColor = isTop3 ? rankColors[index] : '#ECEFF4';
    const avatarBgColors = ['#FFF4D6', '#EEF1F5', '#FBE7D8'];
    const avatarBg = isTop3 ? avatarBgColors[index] : '#EEF4FF';
    const avatarBorder = isTop3 ? rankColors[index] : '#D6E4FF';

    return (
      <View style={styles.card}>
        <Text style={[styles.rankNumber, isTop3 && { color: rankColor }]}>{index + 1}</Text>
        <View
          style={[
            styles.avatarBadge,
            { backgroundColor: avatarBg, borderColor: avatarBorder },
          ]}
        >
          <Text style={styles.avatarEmoji}>{item.avatar || '👤'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
          <Text style={styles.cefrLevel}>Level {item.cefr_level}</Text>
        </View>
        <View style={styles.xpBox}>
          <Text style={styles.xpText}>{item.total_xp} XP</Text>
        </View>
      </View>
    );
  };

  const tabs: { key: LeaderboardTab; label: string }[] = [
    { key: 'global', label: 'Global' },
    { key: 'friends', label: 'Friends' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.username || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {tab === 'friends'
                  ? 'Add friends to see them here.'
                  : 'No users found yet. Be the first to earn XP!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankNumber: {
    width: 28,
    fontSize: 18,
    fontWeight: '700',
    color: '#9AA3B2',
    textAlign: 'center',
    marginRight: 10,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cefrLevel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  xpBox: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ECEFF4',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
  },
});
