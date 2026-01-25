/**
 * Module Progress Card Component
 * Displays progress for a specific module
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ModuleProgress } from '../types';

interface ModuleProgressCardProps {
  progress: ModuleProgress;
  moduleNumber: number;
}

export const ModuleProgressCard: React.FC<ModuleProgressCardProps> = ({
  progress,
  moduleNumber,
}) => {
  const getProgressPercentage = () => {
    if (progress.tasks_completed === 0) return 0;
    const total = progress.tasks_attempted || progress.tasks_completed;
    return Math.round((progress.tasks_completed / total) * 100);
  };

  const getStatusIcon = () => {
    const percentage = getProgressPercentage();
    if (percentage === 100) return '✅';
    if (percentage > 0) return '📖';
    return '⭕';
  };

  const getStatusColor = () => {
    const percentage = getProgressPercentage();
    if (percentage === 100) return '#4CAF50';
    if (percentage > 0) return '#2196F3';
    return '#999';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{moduleNumber}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {progress.module_title}
          </Text>
        </View>
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.tasks_completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.tasks_attempted}</Text>
          <Text style={styles.statLabel}>Attempted</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getStatusColor() }]}>
            {Number(progress.accuracy_percentage || 0).toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgressPercentage()}%`, backgroundColor: getStatusColor() },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
      </View>

      <Text style={styles.lastActivity}>
        Last activity: {formatDate(progress.last_activity_date)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusIcon: {
    fontSize: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  lastActivity: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ModuleProgressCard;
