/**
 * Roadmap Screen
 * Displays all modules in the user's learning roadmap
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, HomeStackParamList } from '../../navigation/MainNavigator';
import { LoadingSpinner, ModuleCard } from '../../components';
import { useAuth, useLearning, useToast } from '../../contexts';
import { roadmapService } from '../../services';
import { Roadmap } from '../../types';

type RoadmapScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Roadmap'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface RoadmapScreenProps {
  navigation: RoadmapScreenNavigationProp;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { currentRoadmap, setCurrentRoadmap, isLoadingRoadmap, setIsLoadingRoadmap } = useLearning();
  const { showError } = useToast();

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRoadmap();
    }, [])
  );

  const loadRoadmap = async () => {
    setIsLoadingRoadmap(true);
    try {
      const response = await roadmapService.getCurrentRoadmap();
      if (response.success && response.data) {
        setCurrentRoadmap(response.data);
      } else if (response.error?.status === 404) {
        // No roadmap yet, just ensure currentRoadmap is null to show empty state
        setCurrentRoadmap(null);
      } else {
        showError('Failed to load your roadmap');
      }
    } catch (error) {
      showError('An error occurred while loading your roadmap');
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRoadmap();
    setRefreshing(false);
  }, []);

  const handleModulePress = (moduleId: number) => {
    navigation.navigate('ModuleDetail', { moduleId });
  };

  const getFirstIncompleteModuleIndex = () => {
    if (!currentRoadmap) return 0;
    const index = currentRoadmap.modules.findIndex((m) => !m.is_completed);
    return index === -1 ? currentRoadmap.modules.length : index;
  };

  if (isLoadingRoadmap && !currentRoadmap) {
    return <LoadingSpinner message="Loading your roadmap..." />;
  }

  if (!currentRoadmap) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Roadmap Yet</Text>
          <Text style={styles.emptyText}>
            Complete the placement test to generate your personalized learning roadmap
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstIncompleteIndex = getFirstIncompleteModuleIndex();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.username || 'Learner'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Your {currentRoadmap.language} learning journey
          </Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              Level: {currentRoadmap.cefr_level}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currentRoadmap.modules.filter((m) => m.is_completed).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currentRoadmap.modules.length}
            </Text>
            <Text style={styles.statLabel}>Total Modules</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(
                (currentRoadmap.modules.filter((m) => m.is_completed).length /
                  currentRoadmap.modules.length) *
                  100
              )}
              %
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        <View style={styles.modulesContainer}>
          <Text style={styles.sectionTitle}>Your Learning Modules</Text>
          {currentRoadmap.modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              moduleNumber={index + 1}
              isLocked={index > firstIncompleteIndex}
              onPress={() => handleModulePress(module.id)}
            />
          ))}
        </View>

        {currentRoadmap.generated_by_ai && (
          <Text style={styles.aiNote}>
            ✨ This roadmap was personalized for you by AI
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  modulesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  aiNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RoadmapScreen;
