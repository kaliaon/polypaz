/**
 * Scenario Selection Screen
 * Shows available dialogue scenarios for practice
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingSpinner, ScenarioCard } from '../../components';
import { useToast, useLearning } from '../../contexts';
import { dialogueService } from '../../services';
import { DialogueScenario } from '../../types';

type ScenarioSelectionScreenNavigationProp = NativeStackNavigationProp<any>;

interface ScenarioSelectionScreenProps {
  navigation: ScenarioSelectionScreenNavigationProp;
}

export const ScenarioSelectionScreen: React.FC<ScenarioSelectionScreenProps> = ({
  navigation,
}) => {
  const { showError } = useToast();
  const { currentRoadmap } = useLearning();

  const [scenarios, setScenarios] = useState<DialogueScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await dialogueService.getScenarios();
      if (response.success && response.data) {
        // Filter scenarios by user's language and level if available
        let filteredScenarios = response.data;

        if (currentRoadmap) {
          filteredScenarios = response.data.filter(
            (scenario) => scenario.language === currentRoadmap.language
          );
        }

        setScenarios(filteredScenarios);
      } else {
        showError('Failed to load scenarios');
      }
    } catch (error) {
      showError('Error loading scenarios');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadScenarios();
  };

  const handleScenarioPress = (scenario: DialogueScenario) => {
    navigation.navigate('ScenarioIntro', { scenario });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading scenarios..." />;
  }

  if (scenarios.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No Scenarios Available</Text>
          <Text style={styles.emptyText}>
            Dialogue scenarios will be available once you complete your placement test and set up your learning path.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose a Scenario</Text>
        <Text style={styles.headerSubtitle}>
          Practice real-world conversations and improve your fluency
        </Text>
      </View>

      <FlatList
        data={scenarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onPress={() => handleScenarioPress(item)}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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

export default ScenarioSelectionScreen;
