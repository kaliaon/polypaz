/**
 * Module Detail Screen
 * Shows detailed information about a specific module
 */

import React, { useState, useEffect } from 'react';
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
import { LoadingSpinner, Button } from '../../components';
import { useLearning, useToast } from '../../contexts';
import { taskService } from '../../services';
import { Module } from '../../types';

type ModuleDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ModuleDetail'
>;

type ModuleDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  'ModuleDetail'
>;

interface ModuleDetailScreenProps {
  navigation: ModuleDetailScreenNavigationProp;
  route: ModuleDetailScreenRouteProp;
}

export const ModuleDetailScreen: React.FC<ModuleDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { moduleId } = route.params;
  const { currentRoadmap } = useLearning();
  const { showError } = useToast();

  const [module, setModule] = useState<Module | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    // Find module from currentRoadmap
    const foundModule = currentRoadmap?.modules.find((m) => m.id === moduleId);
    if (foundModule) {
      setModule(foundModule);
      loadTaskCount();
    }
  }, [moduleId, currentRoadmap]);

  const loadTaskCount = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await taskService.getModuleTasks(moduleId);
      if (response.success && response.data) {
        setTaskCount(response.data.length);
      }
    } catch (error) {
      // Silent fail for task count
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleStartPractice = () => {
    // Navigate to task list for this module
    navigation.navigate('TaskList', {
      moduleId: moduleId,
      moduleTitle: module?.title || 'Tasks',
    });
  };

  if (!module) {
    return <LoadingSpinner message="Loading module..." />;
  }

  const getStatusIcon = () => {
    if (module.is_completed) return '✅';
    return '📖';
  };

  const getStatusText = () => {
    if (module.is_completed) return 'Completed';
    return 'In Progress';
  };

  const getStatusColor = () => {
    if (module.is_completed) return '#4CAF50';
    return '#2196F3';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        <Text style={styles.title}>{module.title}</Text>
        <Text style={styles.description}>{module.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Objectives</Text>
          <Text style={styles.sectionSubtitle}>
            By the end of this module, you will be able to:
          </Text>
          <View style={styles.objectivesList}>
            {module.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Text style={styles.objectiveBullet}>•</Text>
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Module Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tasks Available:</Text>
            <Text style={styles.infoValue}>
              {isLoadingTasks ? '...' : taskCount}
            </Text>
          </View>
          {module.checkpoint_criteria && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Completion Criteria:</Text>
              <Text style={styles.infoValue}>Complete all tasks</Text>
            </View>
          )}
        </View>

        {!module.is_completed && (
          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Tip</Text>
              <Text style={styles.tipText}>
                Practice regularly and review the objectives after each task. Consistency is key to language learning!
              </Text>
            </View>
          </View>
        )}

        {module.is_completed && (
          <View style={styles.completedBox}>
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={styles.completedTitle}>Module Completed!</Text>
            <Text style={styles.completedText}>
              Great job! You've mastered this module. Continue to the next one to keep learning.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={module.is_completed ? 'Review Tasks' : 'Start Practice'}
          onPress={handleStartPractice}
          fullWidth
          size="large"
          variant={module.is_completed ? 'outline' : 'primary'}
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
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  objectivesList: {
    gap: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  objectiveBullet: {
    fontSize: 20,
    color: '#2196F3',
    marginRight: 12,
    marginTop: -2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 24,
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
  completedBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: 24,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#1B5E20',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default ModuleDetailScreen;
