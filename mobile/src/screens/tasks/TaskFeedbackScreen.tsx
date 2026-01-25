/**
 * Task Feedback Screen
 * Displays feedback after submitting a task answer
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
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { Button } from '../../components';
import { TaskAttempt } from '../../types';

type TaskFeedbackScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'TaskFeedback'
>;

type TaskFeedbackScreenRouteProp = RouteProp<HomeStackParamList, 'TaskFeedback'>;

interface TaskFeedbackScreenProps {
  navigation: TaskFeedbackScreenNavigationProp;
  route: TaskFeedbackScreenRouteProp;
}

export const TaskFeedbackScreen: React.FC<TaskFeedbackScreenProps> = ({
  navigation,
  route,
}) => {
  const { attempt, taskId, moduleId } = route.params;

  const handleContinue = () => {
    // Navigate back to task list
    navigation.navigate('TaskList', { moduleId, moduleTitle: '' });
  };

  const handleTryAgain = () => {
    // Navigate back to the task
    navigation.navigate('TaskDetail', { taskId, moduleId });
  };

  const getResultIcon = () => {
    return attempt.is_correct ? '🎉' : '💡';
  };

  const getResultTitle = () => {
    return attempt.is_correct ? 'Correct!' : 'Not Quite Right';
  };

  const getResultColor = () => {
    return attempt.is_correct ? '#4CAF50' : '#FF9800';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.resultHeader, { backgroundColor: getResultColor() }]}>
          <Text style={styles.resultIcon}>{getResultIcon()}</Text>
          <Text style={styles.resultTitle}>{getResultTitle()}</Text>
          {attempt.is_correct && (
            <Text style={styles.xpGained}>+{attempt.xp_gained} XP</Text>
          )}
        </View>

        <View style={styles.content}>
          {!attempt.is_correct && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Answer:</Text>
              <View style={styles.answerBox}>
                <Text style={styles.answerText}>{attempt.user_answer}</Text>
              </View>
            </View>
          )}

          {attempt.feedback.rule && (
            <View style={styles.section}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleIcon}>📖</Text>
                <Text style={styles.sectionTitle}>Rule Explanation</Text>
              </View>
              <View style={styles.ruleBox}>
                <Text style={styles.ruleText}>{attempt.feedback.rule}</Text>
              </View>
            </View>
          )}

          {attempt.feedback.example_contrast && (
            <View style={styles.section}>
              <View style={styles.exampleHeader}>
                <Text style={styles.exampleIcon}>✨</Text>
                <Text style={styles.sectionTitle}>Example</Text>
              </View>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleText}>
                  {attempt.feedback.example_contrast}
                </Text>
              </View>
            </View>
          )}

          {attempt.feedback.explanation && (
            <View style={styles.section}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.sectionTitle}>Tip</Text>
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  {attempt.feedback.explanation}
                </Text>
              </View>
            </View>
          )}

          {attempt.is_correct && (
            <View style={styles.congratsBox}>
              <Text style={styles.congratsText}>
                Great job! You've earned {attempt.xp_gained} XP. Keep up the good work!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!attempt.is_correct && (
          <Button
            title="Try Again"
            onPress={handleTryAgain}
            fullWidth
            size="large"
            variant="outline"
          />
        )}
        <Button
          title={attempt.is_correct ? 'Continue' : 'Skip to Next Task'}
          onPress={handleContinue}
          fullWidth
          size="large"
          variant="primary"
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
  },
  resultHeader: {
    padding: 32,
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  xpGained: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  answerBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  answerText: {
    fontSize: 16,
    color: '#C62828',
    lineHeight: 22,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ruleIcon: {
    fontSize: 20,
  },
  ruleBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  ruleText: {
    fontSize: 15,
    color: '#1565C0',
    lineHeight: 22,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exampleIcon: {
    fontSize: 20,
  },
  exampleBox: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  exampleText: {
    fontSize: 15,
    color: '#6A1B9A',
    lineHeight: 22,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipText: {
    fontSize: 15,
    color: '#E65100',
    lineHeight: 22,
  },
  congratsBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  congratsText: {
    fontSize: 15,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
});

export default TaskFeedbackScreen;
