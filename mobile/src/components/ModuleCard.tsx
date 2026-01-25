/**
 * Module Card Component
 * Displays a learning module with progress and status
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Module } from '../types';

interface ModuleCardProps {
  module: Module;
  moduleNumber: number;
  isLocked?: boolean;
  onPress: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  moduleNumber,
  isLocked = false,
  onPress,
}) => {
  const getStatusIcon = () => {
    if (isLocked) return '🔒';
    if (module.is_completed) return '✅';
    return '📖';
  };

  const getStatusText = () => {
    if (isLocked) return 'Locked';
    if (module.is_completed) return 'Completed';
    return 'In Progress';
  };

  const getStatusColor = () => {
    if (isLocked) return '#999';
    if (module.is_completed) return '#4CAF50';
    return '#2196F3';
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isLocked && styles.cardLocked,
        module.is_completed && styles.cardCompleted,
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{moduleNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <Text style={[styles.title, isLocked && styles.titleLocked]}>
        {module.title}
      </Text>

      <Text
        style={[styles.description, isLocked && styles.descriptionLocked]}
        numberOfLines={2}
      >
        {module.description}
      </Text>

      {!isLocked && (
        <View style={styles.objectivesPreview}>
          <Text style={styles.objectivesLabel}>
            {module.objectives.length} objective{module.objectives.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {isLocked && (
        <Text style={styles.lockedMessage}>
          Complete previous modules to unlock
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  cardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleLocked: {
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  descriptionLocked: {
    color: '#999',
  },
  objectivesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectivesLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  lockedMessage: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default ModuleCard;
