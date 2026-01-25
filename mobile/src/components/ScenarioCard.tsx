/**
 * Scenario Card Component
 * Displays a dialogue scenario option
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { DialogueScenario } from '../types';

interface ScenarioCardProps {
  scenario: DialogueScenario;
  onPress: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onPress,
}) => {
  const getScenarioIcon = () => {
    // Return icon based on scenario title/context
    if (scenario.title.toLowerCase().includes('restaurant')) return '🍽️';
    if (scenario.title.toLowerCase().includes('shop')) return '🛒';
    if (scenario.title.toLowerCase().includes('hotel')) return '🏨';
    if (scenario.title.toLowerCase().includes('airport')) return '✈️';
    if (scenario.title.toLowerCase().includes('doctor')) return '🏥';
    if (scenario.title.toLowerCase().includes('work')) return '💼';
    if (scenario.title.toLowerCase().includes('friend')) return '👥';
    return '💬';
  };

  const getCEFRColor = () => {
    switch (scenario.cefr_level) {
      case 'A0':
      case 'A1':
        return '#4CAF50';
      case 'A2':
      case 'B1':
        return '#2196F3';
      case 'B2':
      case 'C1':
        return '#FF9800';
      case 'C2':
        return '#F44336';
      default:
        return '#999';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getScenarioIcon()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {scenario.title}
          </Text>
          <View style={[styles.levelBadge, { backgroundColor: getCEFRColor() }]}>
            <Text style={styles.levelText}>{scenario.cefr_level}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {scenario.context_description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💬</Text>
            <Text style={styles.infoText}>{scenario.max_turns} turns</Text>
          </View>
          <Text style={styles.startText}>Start →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
  },
  startText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
});

export default ScenarioCard;
