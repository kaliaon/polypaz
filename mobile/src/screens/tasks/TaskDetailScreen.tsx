/**
 * Task Detail Screen
 * Displays a task question and allows user to submit an answer
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { LoadingSpinner, Button } from '../../components';
import { useToast } from '../../contexts';
import { taskService } from '../../services';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'TaskDetail'
>;

type TaskDetailScreenRouteProp = RouteProp<HomeStackParamList, 'TaskDetail'>;

interface TaskDetailScreenProps {
  navigation: TaskDetailScreenNavigationProp;
  route: TaskDetailScreenRouteProp;
}

interface TaskInstance {
  id: number;
  template: {
    id: number;
    task_type: 'multiple_choice' | 'fill_blank' | 'translation';
    difficulty_level: number;
    content: {
      question: string;
      options?: string[];
      context?: string;
    };
  };
  status: 'pending' | 'in_progress' | 'completed';
  attempts_count: number;
  best_attempt_correct: boolean | null;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { taskId, moduleId } = route.params;
  const { showError } = useToast();

  const [task, setTask] = useState<TaskInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await taskService.getTask(taskId);
      if (response.success && response.data) {
        setTask(response.data);
      } else {
        showError('Failed to load task');
      }
    } catch (error) {
      showError('Error loading task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    // Validate answer
    let answer = '';
    if (task.template.task_type === 'multiple_choice') {
      if (!selectedOption) {
        Alert.alert('No Selection', 'Please select an option before submitting.');
        return;
      }
      answer = selectedOption;
    } else {
      if (!userAnswer.trim()) {
        Alert.alert('Empty Answer', 'Please provide an answer before submitting.');
        return;
      }
      answer = userAnswer.trim();
    }

    setIsSubmitting(true);
    try {
      const response = await taskService.submitTaskAttempt(task.template.id, answer);
      if (response.success && response.data) {
        // Navigate to feedback screen
        navigation.navigate('TaskFeedback', {
          attempt: response.data.attempt,
          taskId: task.template.id,
          moduleId: moduleId,
        });
      } else {
        showError('Failed to submit answer');
      }
    } catch (error) {
      showError('Error submitting answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAnswerInput = () => {
    if (!task) return null;

    switch (task.template.task_type) {
      case 'multiple_choice':
        return (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Choose the correct answer:</Text>
            {task.template.content.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedOption(option)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioCircle,
                  selectedOption === option && styles.radioCircleSelected,
                ]}>
                  {selectedOption === option && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedOption === option && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'fill_blank':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Your answer:</Text>
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Fill in the blank with the correct word or phrase.
            </Text>
          </View>
        );

      case 'translation':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Your translation:</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your translation here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              Translate the sentence as accurately as possible.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading task..." />;
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getDifficultyStars = () => {
    return '⭐'.repeat(Math.min(task.template.difficulty_level, 5));
  };

  const getTaskTypeLabel = () => {
    switch (task.template.task_type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'fill_blank':
        return 'Fill in the Blank';
      case 'translation':
        return 'Translation';
      default:
        return 'Task';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>{getTaskTypeLabel()}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{getDifficultyStars()}</Text>
            </View>
          </View>
          {task.attempts_count > 0 && (
            <Text style={styles.attemptsText}>
              Attempts: {task.attempts_count}
            </Text>
          )}
        </View>

        {task.template.content.context && (
          <View style={styles.contextBox}>
            <Text style={styles.contextLabel}>Context:</Text>
            <Text style={styles.contextText}>{task.template.content.context}</Text>
          </View>
        )}

        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{task.template.content.question}</Text>
        </View>

        {renderAnswerInput()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isSubmitting ? 'Submitting...' : 'Submit Answer'}
          onPress={handleSubmit}
          fullWidth
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
  },
  attemptsText: {
    fontSize: 12,
    color: '#666',
  },
  contextBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contextText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2196F3',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#1976D2',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  textAreaInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TaskDetailScreen;
