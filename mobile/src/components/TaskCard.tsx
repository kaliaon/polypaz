/**
 * Task Card Component
 * Displays a learning task with status and difficulty
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface TaskCardProps {
  taskNumber: number;
  taskType: 'multiple_choice' | 'fill_blank' | 'translation';
  difficultyLevel: number;
  isCompleted: boolean;
  isCorrect?: boolean;
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  taskNumber,
  taskType,
  difficultyLevel,
  isCompleted,
  isCorrect,
  onPress,
}) => {
  const getTaskTypeLabel = () => {
    switch (taskType) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'fill_blank':
        return 'Fill in the Blank';
      case 'translation':
        return 'Translation';
      default:
        return 'Task';
    }
  };

  const getTaskTypeIcon = () => {
    switch (taskType) {
      case 'multiple_choice':
        return '⚪';
      case 'fill_blank':
        return '✏️';
      case 'translation':
        return '🌐';
      default:
        return '📝';
    }
  };

  const getStatusIcon = () => {
    if (!isCompleted) return '⭕';
    return isCorrect ? '✅' : '❌';
  };

  const getStatusColor = () => {
    if (!isCompleted) return '#2196F3';
    return isCorrect ? '#4CAF50' : '#F44336';
  };

  const getDifficultyStars = () => {
    return '⭐'.repeat(Math.min(difficultyLevel, 5));
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.taskNumber}>
          <Text style={styles.taskNumberText}>#{taskNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.typeRow}>
          <Text style={styles.typeIcon}>{getTaskTypeIcon()}</Text>
          <Text style={styles.typeText}>{getTaskTypeLabel()}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyLabel}>Difficulty:</Text>
            <Text style={styles.difficultyStars}>{getDifficultyStars()}</Text>
          </View>
          {isCompleted && (
            <Text style={[
              styles.completedText,
              { color: getStatusColor() }
            ]}>
              {isCorrect ? 'Completed' : 'Try Again'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskNumber: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 16,
  },
  content: {
    gap: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyLabel: {
    fontSize: 12,
    color: '#666',
  },
  difficultyStars: {
    fontSize: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TaskCard;
