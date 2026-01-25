/**
 * Learning Preferences Screen
 * User sets their learning goals and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Button } from '../../components';
import { useAuth, useToast } from '../../contexts';
import { authService, placementService } from '../../services';

type LearningPreferencesScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'LearningPreferences'
>;

type LearningPreferencesScreenRouteProp = RouteProp<
  OnboardingStackParamList,
  'LearningPreferences'
>;

interface LearningPreferencesScreenProps {
  navigation: LearningPreferencesScreenNavigationProp;
  route: LearningPreferencesScreenRouteProp;
}

const GOALS = [
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'work', label: 'Work/Business', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'family', label: 'Family/Friends', icon: '👨‍👩‍👧' },
  { id: 'culture', label: 'Culture/Entertainment', icon: '🎭' },
  { id: 'personal', label: 'Personal Growth', icon: '🌱' },
];

const DAILY_TIME_OPTIONS = [
  { id: '5', label: '5-10 min', description: 'Quick daily practice' },
  { id: '15', label: '15-20 min', description: 'Moderate learning' },
  { id: '30', label: '30+ min', description: 'Intensive study' },
];

export const LearningPreferencesScreen: React.FC<LearningPreferencesScreenProps> = ({
  navigation,
  route,
}) => {
  const { targetLanguage, nativeLanguage } = route.params;
  const { showSuccess, showError } = useToast();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('15');
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update user profile with languages and preferences
      const response = await authService.updateProfile({
        target_language: targetLanguage,
        native_language: nativeLanguage,
        learning_preferences: {
          goals: selectedGoals,
          daily_time_minutes: parseInt(selectedTime),
          // Note: onboarding_completed will be set after placement test
        },
      });

      if (response.success) {
        // Don't refresh profile here - it causes onboarding to restart!
        // Profile will be refreshed after placement test when onboarding_completed is set
        showSuccess('Profile saved! Time for your placement test.');
        
        // Navigate to placement test
        await navigateToPlacementTest();
      } else {
        showError('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      // Save just the languages without preferences
      const response = await authService.updateProfile({
        target_language: targetLanguage,
        native_language: nativeLanguage,
        learning_preferences: {
          // Note: onboarding_completed will be set after placement test
        },
      });

      if (response.success) {
        // Don't refresh profile here - it causes onboarding to restart!
        // Profile will be refreshed after placement test when onboarding_completed is set
        showSuccess('Time for your placement test!');
        
        // Navigate to placement test
        await navigateToPlacementTest();
      } else {
        showError('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPlacementTest = async () => {
    try {
      // Fetch available placement tests for the target language
      const testsResponse = await placementService.getTests();
      
      if (testsResponse.success && testsResponse.data && testsResponse.data.length > 0) {
        // Find test for the selected target language
        const test = testsResponse.data.find(t => t.language === targetLanguage);
        
        if (test) {
          navigation.navigate('PlacementIntro', {
            testId: test.id,
            language: targetLanguage,
          });
        } else {
          showError(`No placement test available for ${targetLanguage}.`);
        }
      } else {
        showError('No placement tests available.');
      }
    } catch (error) {
      showError('Failed to load placement test.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What are your learning goals?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your learning experience (optional)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Goals</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoals.includes(goal.id) && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text
                  style={[
                    styles.goalLabel,
                    selectedGoals.includes(goal.id) && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Practice Time</Text>
          <Text style={styles.sectionSubtitle}>How much time can you dedicate daily?</Text>
          <View style={styles.timeContainer}>
            {DAILY_TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.timeCard,
                  selectedTime === option.id && styles.timeCardSelected,
                ]}
                onPress={() => setSelectedTime(option.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeLabel,
                    selectedTime === option.id && styles.timeLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.timeDescription,
                    selectedTime === option.id && styles.timeDescriptionSelected,
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Skip for Now"
          onPress={handleSkip}
          variant="outline"
          fullWidth
          disabled={isLoading}
          style={styles.skipButton}
        />
        <Button
          title="Complete Setup"
          onPress={handleComplete}
          loading={isLoading}
          disabled={isLoading}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '47%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  goalCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#2196F3',
  },
  timeContainer: {
    gap: 12,
  },
  timeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timeCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeLabelSelected: {
    color: '#2196F3',
  },
  timeDescription: {
    fontSize: 14,
    color: '#666',
  },
  timeDescriptionSelected: {
    color: '#1976D2',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  skipButton: {
    marginBottom: 0,
  },
});

export default LearningPreferencesScreen;
