/**
 * Dialogue Completion Screen
 * Shows session summary after completing a dialogue
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
import { Button } from '../../components';
import { DialogueSession } from '../../types';

type DialogueCompletionScreenNavigationProp = NativeStackNavigationProp<any>;
type DialogueCompletionScreenRouteProp = RouteProp<{ params: { session: DialogueSession } }, 'params'>;

interface DialogueCompletionScreenProps {
  navigation: DialogueCompletionScreenNavigationProp;
  route: DialogueCompletionScreenRouteProp;
}

export const DialogueCompletionScreen: React.FC<DialogueCompletionScreenProps> = ({
  navigation,
  route,
}) => {
  const { session } = route.params;

  const handleBackToScenarios = () => {
    navigation.navigate('ScenarioSelection');
  };

  const getTotalCorrections = () => {
    return session.turns.reduce((total, turn) => {
      return total + (turn.corrections?.length || 0);
    }, 0);
  };

  const getReformulationsCount = () => {
    return session.turns.filter(turn => turn.reformulation).length;
  };

  const getSessionDuration = () => {
    const start = new Date(session.started_at);
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    return minutes > 0 ? `${minutes} min` : 'Less than a minute';
  };

  const totalCorrections = getTotalCorrections();
  const reformulations = getReformulationsCount();
  const turnsCompleted = session.turns.length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>Conversation Complete!</Text>
          <Text style={styles.subtitle}>
            Great job practicing with {session.scenario.title}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{turnsCompleted}</Text>
            <Text style={styles.statLabel}>Turns Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getSessionDuration()}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>✏️</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Corrections Received</Text>
                <Text style={styles.summaryValue}>
                  {totalCorrections} {totalCorrections === 1 ? 'correction' : 'corrections'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>💡</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Better Phrasings</Text>
                <Text style={styles.summaryValue}>
                  {reformulations} {reformulations === 1 ? 'suggestion' : 'suggestions'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>🎯</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Practice Level</Text>
                <Text style={styles.summaryValue}>{session.scenario.cefr_level}</Text>
              </View>
            </View>
          </View>
        </View>

        {totalCorrections > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Corrections</Text>
            <View style={styles.correctionsContainer}>
              {session.turns.slice(-3).reverse().map((turn, index) => {
                if (!turn.corrections || turn.corrections.length === 0) return null;
                return (
                  <View key={turn.id} style={styles.correctionCard}>
                    <Text style={styles.correctionTurn}>Turn {turn.turn_number}</Text>
                    {turn.corrections.slice(0, 2).map((correction, cIndex) => (
                      <View key={cIndex} style={styles.correctionItem}>
                        <Text style={styles.correctionOriginal}>
                          ❌ {correction.original}
                        </Text>
                        <Text style={styles.correctionCorrected}>
                          ✅ {correction.corrected}
                        </Text>
                        <Text style={styles.correctionExplanation}>
                          {correction.explanation}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.encouragementBox}>
          <Text style={styles.encouragementIcon}>⭐</Text>
          <Text style={styles.encouragementText}>
            {totalCorrections === 0
              ? "Excellent! You completed this conversation without any corrections. Keep up the great work!"
              : "Every correction is a step forward in your language journey. Review these insights and keep practicing!"}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back to Scenarios"
          onPress={handleBackToScenarios}
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
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {
    fontSize: 20,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  correctionsContainer: {
    gap: 12,
  },
  correctionCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  correctionTurn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 12,
  },
  correctionItem: {
    marginBottom: 12,
  },
  correctionOriginal: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 4,
  },
  correctionCorrected: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
  correctionExplanation: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  encouragementBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  encouragementIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  encouragementText: {
    fontSize: 15,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default DialogueCompletionScreen;
