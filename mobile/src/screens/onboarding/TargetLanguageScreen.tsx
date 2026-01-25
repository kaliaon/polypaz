/**
 * Target Language Selection Screen
 * User selects which language they want to learn
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Button, LanguageCard } from '../../components';
import { Language } from '../../types';

type TargetLanguageScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'TargetLanguage'
>;

interface TargetLanguageScreenProps {
  navigation: TargetLanguageScreenNavigationProp;
}

const LANGUAGES = [
  { code: 'kazakh', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: 'russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const TargetLanguageScreen: React.FC<TargetLanguageScreenProps> = ({
  navigation,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleContinue = () => {
    if (selectedLanguage) {
      navigation.navigate('NativeLanguage', { targetLanguage: selectedLanguage });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What language do you want to learn?</Text>
          <Text style={styles.subtitle}>
            Choose the language you'd like to master with PolyPath
          </Text>
        </View>

        <View style={styles.languageList}>
          {LANGUAGES.map((language) => (
            <LanguageCard
              key={language.code}
              language={language}
              selected={selectedLanguage === language.code}
              onPress={() => setSelectedLanguage(language.code as Language)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedLanguage}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  languageList: {
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default TargetLanguageScreen;
