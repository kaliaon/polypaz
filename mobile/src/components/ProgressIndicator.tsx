/**
 * Progress Indicator Component
 * Shows progress through a multi-step process
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  style?: object;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  style,
}) => {
  const percentage = (current / total) * 100;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          Question {current} of {total}
        </Text>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
});

export default ProgressIndicator;
