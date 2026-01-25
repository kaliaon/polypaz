/**
 * Placement Test Introduction Screen
 * Explains the placement test and its purpose
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PlacementStackParamList } from '../../navigation/PlacementNavigator';
import { Button } from '../../components';

type PlacementIntroScreenNavigationProp = NativeStackNavigationProp<
  PlacementStackParamList,
  'PlacementIntro'
>;

type PlacementIntroScreenRouteProp = RouteProp<
  PlacementStackParamList,
  'PlacementIntro'
>;

interface PlacementIntroScreenProps {
  navigation: PlacementIntroScreenNavigationProp;
  route: PlacementIntroScreenRouteProp;
}

const FEATURES = [
  {
    icon: '📊',
    title: 'Assess Your Level',
    description: 'Determine your current proficiency level (A0-C2)',
  },
  {
    icon: '🎯',
    title: 'Personalized Learning',
    description: 'Get a custom roadmap based on your results',
  },
  {
    icon: '⏱️',
    title: 'Quick & Easy',
    description: 'Takes only 5-10 minutes to complete',
  },
  {
    icon: '✅',
    title: 'No Pressure',
    description: 'Answer to the best of your ability - there are no wrong answers',
  },
];

export const PlacementIntroScreen: React.FC<PlacementIntroScreenProps> = ({
  navigation,
  route,
}) => {
  const { testId, language } = route.params;

  const handleStartTest = () => {
    navigation.navigate('PlacementTest', { testId, language });
  };

  const handleSkip = () => {
    // Navigate to main app without taking test (optional)
    // For now, just show the test
    handleStartTest();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.title}>Placement Test</Text>
          <Text style={styles.subtitle}>
            Let's find your starting point and create the perfect learning path for you
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What to Expect:</Text>
          <Text style={styles.infoText}>
            • 10-12 questions covering vocabulary, grammar, and comprehension
          </Text>
          <Text style={styles.infoText}>
            • Multiple choice, fill-in-the-blank, and translation questions
          </Text>
          <Text style={styles.infoText}>
            • Your results will determine your CEFR level (A0-C2)
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Placement Test"
          onPress={handleStartTest}
          fullWidth
          size="large"
        />
        <Button
          title="Skip for Now"
          onPress={handleSkip}
          variant="text"
          fullWidth
          style={styles.skipButton}
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
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 22,
    marginBottom: 4,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  skipButton: {
    marginTop: 8,
  },
});

export default PlacementIntroScreen;
