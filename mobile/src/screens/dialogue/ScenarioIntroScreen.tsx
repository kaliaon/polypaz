/**
 * Scenario Intro Screen
 * Shows scenario details before starting a dialogue session
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
import { Button } from '../../components';
import { useToast } from '../../contexts';
import { dialogueService } from '../../services';
import { DialogueScenario } from '../../types';

type ScenarioIntroScreenNavigationProp = NativeStackNavigationProp<any>;
type ScenarioIntroScreenRouteProp = RouteProp<{ params: { scenario: DialogueScenario } }, 'params'>;

interface ScenarioIntroScreenProps {
  navigation: ScenarioIntroScreenNavigationProp;
  route: ScenarioIntroScreenRouteProp;
}

export const ScenarioIntroScreen: React.FC<ScenarioIntroScreenProps> = ({
  navigation,
  route,
}) => {
  const { scenario } = route.params;
  const { showError } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const response = await dialogueService.startSession({
        scenario_id: scenario.id,
      });

      if (response.success && response.data) {
        navigation.navigate('DialogueChat', {
          session: response.data,
        });
      } else {
        showError('Failed to start dialogue session');
      }
    } catch (error) {
      showError('Error starting session');
    } finally {
      setIsStarting(false);
    }
  };

  const getScenarioIcon = () => {
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getScenarioIcon()}</Text>
        </View>

        <Text style={styles.title}>{scenario.title}</Text>

        <View style={[styles.levelBadge, { backgroundColor: getCEFRColor() }]}>
          <Text style={styles.levelText}>Level: {scenario.cefr_level}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scenario</Text>
          <View style={styles.contextBox}>
            <Text style={styles.contextText}>{scenario.context_description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💬</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Conversation Turns</Text>
                <Text style={styles.infoValue}>
                  Up to {scenario.max_turns} back-and-forth exchanges
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✏️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Real-time Corrections</Text>
                <Text style={styles.infoValue}>
                  Get instant feedback on grammar and vocabulary
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🤖</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>AI Conversation Partner</Text>
                <Text style={styles.infoValue}>
                  Practice with an intelligent dialogue system
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Tip</Text>
            <Text style={styles.tipText}>
              Take your time to think about your responses. Focus on expressing yourself naturally rather than perfectly.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isStarting ? 'Starting...' : 'Start Conversation'}
          onPress={handleStartSession}
          fullWidth
          size="large"
          loading={isStarting}
          disabled={isStarting}
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contextBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  contextText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default ScenarioIntroScreen;
