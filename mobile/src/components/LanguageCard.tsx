/**
 * Language Card Component
 * Selectable card for language selection
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface LanguageCardProps {
  language: {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
  };
  selected: boolean;
  onPress: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{language.flag}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.name, selected && styles.nameSelected]}>
          {language.name}
        </Text>
        <Text style={[styles.nativeName, selected && styles.nativeNameSelected]}>
          {language.nativeName}
        </Text>
      </View>
      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  flag: {
    fontSize: 40,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nameSelected: {
    color: '#2196F3',
  },
  nativeName: {
    fontSize: 14,
    color: '#666',
  },
  nativeNameSelected: {
    color: '#1976D2',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LanguageCard;
