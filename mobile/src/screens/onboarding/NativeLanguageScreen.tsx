/**
 * Native Language Selection Screen
 * User selects their native/primary language
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
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Button, LanguageCard } from '../../components';
import { Language } from '../../types';

type NativeLanguageScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'NativeLanguage'
>;

type NativeLanguageScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'NativeLanguage'
>;

interface NativeLanguageScreenProps {
  navigation: NativeLanguageScreenNavigationProp;
  route: NativeLanguageScreenRouteProp;
}

const LANGUAGES = [
  { code: 'kazakh', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: 'russian', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export const NativeLanguageScreen: React.FC<NativeLanguageScreenProps> = ({
  navigation,
  route,
}) => {
  const { targetLanguage } = route.params;
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');

  // Filter out target language from options
  const availableLanguages = LANGUAGES.filter(
    (lang) => lang.code !== targetLanguage
  );

  const handleContinue = () => {
    navigation.navigate('LearningPreferences', {
      targetLanguage,
      nativeLanguage: selectedLanguage,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What's your native language?</Text>
          <Text style={styles.subtitle}>
            This helps us provide better explanations and examples in your learning journey
          </Text>
        </View>

        <View style={styles.languageList}>
          {availableLanguages.map((language) => (
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

export default NativeLanguageScreen;
