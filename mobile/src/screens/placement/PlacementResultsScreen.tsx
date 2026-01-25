/**
 * Placement Test Results Screen
 * Shows test results and CEFR level
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
import { PlacementStackParamList } from '../../navigation/PlacementNavigator';
import { Button } from '../../components';
import { useAuth, useToast } from '../../contexts';
import { roadmapService, authService } from '../../services';
import { PlacementTestResult, CEFRLevel } from '../../types';

type PlacementResultsScreenNavigationProp = NativeStackNavigationProp<
  PlacementStackParamList,
  'PlacementResults'
>;

type PlacementResultsScreenRouteProp = RouteProp<
  PlacementStackParamList,
  'PlacementResults'
>;

interface PlacementResultsScreenProps {
  navigation: PlacementResultsScreenNavigationProp;
  route: PlacementResultsScreenRouteProp;
}

const CEFR_INFO: Record<CEFRLevel, { title: string; description: string }> = {
  A0: {
    title: 'Complete Beginner',
    description: 'You\'re just starting your language learning journey. Don\'t worry, everyone starts here!',
  },
  A1: {
    title: 'Elementary',
    description: 'You can understand and use familiar everyday expressions and very basic phrases.',
  },
  A2: {
    title: 'Pre-Intermediate',
    description: 'You can communicate in simple routine tasks requiring a direct exchange of information.',
  },
  B1: {
    title: 'Intermediate',
    description: 'You can deal with most situations likely to arise while traveling and can produce simple text.',
  },
  B2: {
    title: 'Upper Intermediate',
    description: 'You can interact with a degree of fluency and spontaneity without much strain.',
  },
  C1: {
    title: 'Advanced',
    description: 'You can express yourself fluently and spontaneously with great flexibility and precision.',
  },
  C2: {
    title: 'Proficient',
    description: 'You have a near-native level of language proficiency. Excellent work!',
  },
};

export const PlacementResultsScreen: React.FC<PlacementResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { result, language } = route.params;
  const { refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Ensure score and max_score are numbers (they might come as strings from API)
  const score = Number(result.score || 0);
  const maxScore = Number(result.max_score || 0);

  const percentage = maxScore > 0
    ? Math.round((score / maxScore) * 100)
    : 0;

  const cefrLevel = result.estimated_cefr_level || 'A0';
  const cefrInfo = CEFR_INFO[cefrLevel] || CEFR_INFO.A0;

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const response = await roadmapService.generateRoadmap({
        placement_test_result_id: result.id,
        language,
        cefr_level: result.estimated_cefr_level,
      });

      if (response.success) {
        // Mark onboarding as completed now that user has taken test and has roadmap
        const profileResponse = await authService.updateProfile({
          learning_preferences: {
            onboarding_completed: true,
          },
        });

        if (profileResponse.success) {
          await refreshProfile();
          showSuccess('Your personalized roadmap is ready!');
          // AppNavigator will now redirect to Main app since onboarding_completed is true
        } else {
          showSuccess('Roadmap created! Redirecting...');
          // Even if profile update fails, roadmap was created successfully
          await refreshProfile();
        }
      } else {
        showError('Failed to generate roadmap. Please try again.');
      }
    } catch (error) {
      showError('An error occurred while generating your roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>Test Complete!</Text>
          <Text style={styles.subtitle}>Here are your results</Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          <View style={styles.scoreDetails}>
            <Text style={styles.scoreText}>
              {score.toFixed(1)} / {maxScore.toFixed(1)}
            </Text>
            <Text style={styles.scoreSubtext}>points earned</Text>
          </View>
        </View>

        <View style={styles.cefrCard}>
          <View style={styles.cefrHeader}>
            <Text style={styles.cefrBadge}>{cefrLevel}</Text>
            <Text style={styles.cefrTitle}>{cefrInfo.title}</Text>
          </View>
          <Text style={styles.cefrDescription}>{cefrInfo.description}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            We'll create a personalized learning roadmap tailored to your level. This roadmap will guide you through structured modules designed to help you progress effectively.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="📚" text="Custom learning modules" />
          <FeatureItem icon="🎯" text="Level-appropriate exercises" />
          <FeatureItem icon="💬" text="Interactive dialogue practice" />
          <FeatureItem icon="📈" text="Track your progress" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Generate My Roadmap"
          onPress={handleGenerateRoadmap}
          loading={isGenerating}
          disabled={isGenerating}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  icon: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    gap: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cefrCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cefrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cefrBadge: {
    backgroundColor: '#4CAF50',
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  cefrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  cefrDescription: {
    fontSize: 15,
    color: '#1B5E20',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default PlacementResultsScreen;
