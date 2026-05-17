/**
 * Profile Screen
 * Shows user information and logout option
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import progressService from '../../services/progress.service';
import friendsService from '../../services/friends.service';
import { AchievementStatus, PendingFriendRequest } from '../../types';

const EMOJI_LIST = ['👤', '🦁', '🐼', '🦊', '🐱', '🐶', '🐯', '🐸', '🐵', '🚀', '⭐', '🔥', '💎', '🎮', '💡', '🌟', '🦸‍♀️', '🥷', '👾', '👻'];

export const ProfileScreen: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [achievements, setAchievements] = useState<AchievementStatus[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementStatus | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const loadAchievements = useCallback(async () => {
    try {
      const response = await progressService.getAchievements();
      if (response.success && response.data) {
        setAchievements(response.data.achievements);
      }
    } catch (e) {
      console.error('Failed to load achievements', e);
    } finally {
      setAchievementsLoading(false);
    }
  }, []);

  const loadPending = useCallback(async () => {
    try {
      const res = await friendsService.pending();
      if (res.success && Array.isArray(res.data)) {
        setPendingRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load pending friend requests', e);
    }
  }, []);

  const handleAcceptFriend = async (req: PendingFriendRequest) => {
    setAcceptingId(req.id);
    try {
      const res = await friendsService.accept(req.id);
      if (res.success) {
        setPendingRequests((prev) => prev.filter((p) => p.id !== req.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAchievements();
      loadPending();
    }, [loadAchievements, loadPending])
  );

  const earnedCount = achievements.filter((a) => a.is_earned).length;

  const handleLogout = async () => {
    await logout();
  };

  const handleAvatarSelect = async (emoji: string) => {
    try {
      setSavingAvatar(true);
      await apiService.put(API_ENDPOINTS.AUTH.PROFILE, {
        profile: { avatar: emoji }
      });
      await refreshProfile();
      setModalVisible(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {user?.profile?.avatar || user?.username?.charAt(0).toUpperCase() || '👤'}
            </Text>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        </View>

        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friend Requests</Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.pendingRow}>
                <View style={styles.pendingAvatar}>
                  <Text style={styles.pendingAvatarEmoji}>
                    {req.from_user.avatar || '👤'}
                  </Text>
                </View>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingUsername} numberOfLines={1}>
                    {req.from_user.username}
                  </Text>
                  <Text style={styles.pendingMeta}>Level {req.from_user.cefr_level}</Text>
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptFriend(req)}
                  disabled={acceptingId === req.id}
                >
                  {acceptingId === req.id ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {!achievementsLoading && (
              <Text style={styles.achievementsCount}>
                {earnedCount}/{achievements.length}
              </Text>
            )}
          </View>
          {achievementsLoading ? (
            <ActivityIndicator color="#2196F3" style={{ marginVertical: 12 }} />
          ) : achievements.length === 0 ? (
            <Text style={styles.achievementsEmpty}>No achievements yet.</Text>
          ) : (
            <View style={styles.badgesGrid}>
              {achievements.map((a) => (
                <TouchableOpacity
                  key={a.code}
                  style={styles.badgeCell}
                  onPress={() => setSelectedAchievement(a)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.badgeCircle,
                      a.is_earned ? styles.badgeEarned : styles.badgeLocked,
                    ]}
                  >
                    <Text style={[styles.badgeIcon, !a.is_earned && styles.badgeIconLocked]}>
                      {a.is_earned ? a.icon : '🔒'}
                    </Text>
                  </View>
                  <Text style={styles.badgeLabel} numberOfLines={1}>
                    {a.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Native Language</Text>
            <Text style={styles.infoValue}>
              {user?.profile?.native_language || 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Language</Text>
            <Text style={styles.infoValue}>
              {user?.profile?.target_language || 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Level</Text>
            <Text style={styles.infoValue}>
              {user?.profile?.current_cefr_level || 'Not set'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            {selectedAchievement && (
              <>
                <View
                  style={[
                    styles.detailIconCircle,
                    selectedAchievement.is_earned ? styles.badgeEarned : styles.badgeLocked,
                  ]}
                >
                  <Text style={styles.detailIcon}>
                    {selectedAchievement.is_earned ? selectedAchievement.icon : '🔒'}
                  </Text>
                </View>
                <Text style={styles.detailTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.detailDescription}>{selectedAchievement.description}</Text>
                <Text style={styles.detailStatus}>
                  {selectedAchievement.is_earned
                    ? selectedAchievement.earned_at
                      ? `Earned ${new Date(selectedAchievement.earned_at).toLocaleDateString()}`
                      : 'Earned'
                    : 'Not unlocked yet'}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.detailCloseButton}
              onPress={() => setSelectedAchievement(null)}
            >
              <Text style={styles.detailCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose your Avatar</Text>
            {savingAvatar ? (
              <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 40 }} />
            ) : (
              <FlatList
                data={EMOJI_LIST}
                numColumns={4}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.emojiItem} onPress={() => handleAvatarSelect(item)}>
                    <Text style={styles.emojiText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)} disabled={savingAvatar}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  avatarText: {
    fontSize: 32,
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editBadgeText: {
    fontSize: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  emojiText: {
    fontSize: 32,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  achievementsEmpty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  badgeCell: {
    width: '25%',
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
  },
  badgeEarned: {
    backgroundColor: '#FFF4D6',
    borderColor: '#FFC107',
  },
  badgeLocked: {
    backgroundColor: '#F0F2F5',
    borderColor: '#D8DDE5',
  },
  badgeIcon: {
    fontSize: 28,
    lineHeight: 32,
  },
  badgeIconLocked: {
    opacity: 0.55,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    fontWeight: '600',
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  detailIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  detailIcon: {
    fontSize: 40,
    lineHeight: 48,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  detailStatus: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  detailCloseButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 12,
  },
  detailCloseText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pendingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#D6E4FF',
  },
  pendingAvatarEmoji: { fontSize: 20, lineHeight: 24 },
  pendingInfo: { flex: 1 },
  pendingUsername: { fontSize: 15, fontWeight: '600', color: '#222' },
  pendingMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  acceptButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
