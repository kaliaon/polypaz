/**
 * Progress Overview Screen
 * Shows overall learning progress, statistics, and module-wise breakdown
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, StatCard, ModuleProgressCard } from '../../components';
import { useToast, useAuth } from '../../contexts';
import { progressService } from '../../services';
import { ProgressOverview } from '../../types';

export const ProgressOverviewScreen: React.FC = () => {
  const { showError } = useToast();
  const { user } = useAuth();

  const [progress, setProgress] = useState<ProgressOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const response = await progressService.getProgressOverview();
      if (response.success && response.data) {
        setProgress(response.data);
      } else {
        showError('Failed to load progress data');
      }
    } catch (error) {
      showError('Error loading progress');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProgress();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading progress..." />;
  }

  if (!progress) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Progress Data</Text>
          <Text style={styles.emptyText}>
            Start learning to see your progress here!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getCompletedModules = () => {
    return progress.modules.filter(m =>
      m.tasks_completed > 0 && m.tasks_completed === m.tasks_attempted
    ).length;
  };

  const getStreakMessage = () => {
    const days = progress.current_streak_days;
    if (days === 0) return "Start your streak today! 🔥";
    if (days === 1) return "1 day streak! Keep it up! 🔥";
    return `${days} day streak! Amazing! 🔥`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.username}! 👋</Text>
          <Text style={styles.subtitle}>Here's your learning progress</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <StatCard
                icon="⭐"
                value={progress.total_xp || 0}
                label="Total XP"
                color="#FF9800"
                style={styles.statCardHalf}
              />
              <StatCard
                icon="🔥"
                value={progress.current_streak_days || 0}
                label="Day Streak"
                color="#F44336"
                style={styles.statCardHalf}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                icon="✅"
                value={getCompletedModules()}
                label="Modules Completed"
                color="#4CAF50"
                style={styles.statCardHalf}
              />
              <StatCard
                icon="🎯"
                value={`${Number(progress.overall_accuracy || 0).toFixed(0)}%`}
                label="Overall Accuracy"
                color="#2196F3"
                style={styles.statCardHalf}
              />
            </View>
          </View>
        </View>

        {progress.current_streak_days > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakContent}>
              <Text style={styles.streakTitle}>{getStreakMessage()}</Text>
              <Text style={styles.streakText}>
                Your longest streak: {progress.longest_streak_days} days
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module Progress</Text>
          {progress.modules.length === 0 ? (
            <View style={styles.emptyModules}>
              <Text style={styles.emptyModulesText}>
                No modules available yet. Complete your placement test to get started!
              </Text>
            </View>
          ) : (
            progress.modules.map((moduleProgress, index) => (
              <ModuleProgressCard
                key={moduleProgress.module_id}
                progress={moduleProgress}
                moduleNumber={index + 1}
              />
            ))
          )}
        </View>

        {progress.modules.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tasks Completed:</Text>
              <Text style={styles.summaryValue}>
                {progress.modules.reduce((sum, m) => sum + (m.tasks_completed || 0), 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tasks Attempted:</Text>
              <Text style={styles.summaryValue}>
                {progress.modules.reduce((sum, m) => sum + (m.tasks_attempted || 0), 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Accuracy:</Text>
              <Text style={styles.summaryValue}>
                {Number(progress.overall_accuracy || 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.motivationBox}>
          <Text style={styles.motivationIcon}>⭐</Text>
          <Text style={styles.motivationText}>
            Keep learning every day to maintain your streak and earn more XP!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardHalf: {
    flex: 1,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    alignItems: 'center',
    gap: 16,
  },
  streakIcon: {
    fontSize: 40,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  emptyModules: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyModulesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  motivationBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  motivationIcon: {
    fontSize: 32,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProgressOverviewScreen;
