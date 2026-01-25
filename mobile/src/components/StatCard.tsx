/**
 * Stat Card Component
 * Displays a statistic with icon and label
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = '#2196F3',
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});

export default StatCard;
