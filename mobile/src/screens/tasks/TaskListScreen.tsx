/**
 * Task List Screen
 * Shows all tasks for a specific module
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { LoadingSpinner, TaskCard } from '../../components';
import { useToast, useLearning } from '../../contexts';
import { taskService } from '../../services';

type TaskListScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'TaskList'
>;

type TaskListScreenRouteProp = RouteProp<HomeStackParamList, 'TaskList'>;

interface TaskListScreenProps {
  navigation: TaskListScreenNavigationProp;
  route: TaskListScreenRouteProp;
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

export const TaskListScreen: React.FC<TaskListScreenProps> = ({
  navigation,
  route,
}) => {
  const { moduleId, moduleTitle } = route.params;
  const { showError } = useToast();
  const { currentRoadmap } = useLearning();

  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [moduleId])
  );

  const loadTasks = async () => {
    try {
      const response = await taskService.getModuleTasks(moduleId);
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        showError('Failed to load tasks');
      }
    } catch (error) {
      showError('Error loading tasks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTasks();
  };

  const handleTaskPress = (task: TaskInstance) => {
    navigation.navigate('TaskDetail', {
      taskId: task.template.id,
      moduleId: moduleId,
    });
  };

  const getCompletedCount = () => {
    return tasks.filter(t => t.status === 'completed' && t.best_attempt_correct).length;
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    return Math.round((getCompletedCount() / tasks.length) * 100);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Tasks Available</Text>
          <Text style={styles.emptyText}>
            Tasks for this module will be available soon.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.moduleTitle}>{moduleTitle}</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <Text style={styles.progressValue}>
              {getCompletedCount()} / {tasks.length} tasks
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {getProgressPercentage()}% Complete
          </Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TaskCard
            taskNumber={index + 1}
            taskType={item.template.task_type}
            difficultyLevel={item.template.difficulty_level}
            isCompleted={item.status === 'completed'}
            isCorrect={item.best_attempt_correct || false}
            onPress={() => handleTaskPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#1565C0',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TaskListScreen;
