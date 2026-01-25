/**
 * Placement Test Screen
 * Main test interface with question navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { PlacementStackParamList } from '../../navigation/PlacementNavigator';
import {
  Button,
  LoadingSpinner,
  ProgressIndicator,
  MultipleChoiceQuestion,
  FillBlankQuestion,
  TranslationQuestion,
} from '../../components';
import { useToast } from '../../contexts';
import { placementService } from '../../services';
import { PlacementTest, PlacementTestItem } from '../../types';

type PlacementTestScreenNavigationProp = NativeStackNavigationProp<
  PlacementStackParamList,
  'PlacementTest'
>;

type PlacementTestScreenRouteProp = RouteProp<
  PlacementStackParamList,
  'PlacementTest'
>;

interface PlacementTestScreenProps {
  navigation: PlacementTestScreenNavigationProp;
  route: PlacementTestScreenRouteProp;
}

export const PlacementTestScreen: React.FC<PlacementTestScreenProps> = ({
  navigation,
  route,
}) => {
  const { testId } = route.params;
  const { showError } = useToast();

  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    setIsLoading(true);
    try {
      const response = await placementService.getTest(testId);
      if (response.success && response.data) {
        setTest(response.data);
      } else {
        showError('Failed to load placement test');
        navigation.goBack();
      }
    } catch (error) {
      showError('An error occurred while loading the test');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (test && currentQuestionIndex < test.items.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredCount = test?.items.filter(
      (item) => !answers[item.id] || answers[item.id].trim() === ''
    ).length || 0;

    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Test',
        `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Submit', onPress: submitTest },
        ]
      );
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    if (!test) return;

    setIsSubmitting(true);
    try {
      const response = await placementService.submitTest(test.id, answers);
      if (response.success && response.data) {
        navigation.navigate('PlacementResults', {
          result: response.data,
          language: test.language,
        });
      } else {
        showError('Failed to submit test. Please try again.');
      }
    } catch (error) {
      showError('An error occurred while submitting the test');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !test) {
    return <LoadingSpinner message="Loading test..." />;
  }

  const currentItem = test.items[currentQuestionIndex];
  const currentAnswer = answers[currentItem.id] || '';
  const isLastQuestion = currentQuestionIndex === test.items.length - 1;

  const renderQuestion = () => {
    switch (currentItem.item_type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            item={currentItem}
            selectedAnswer={currentAnswer}
            onAnswerSelect={(answer) => handleAnswerChange(currentItem.id, answer)}
          />
        );
      case 'fill_blank':
      case 'cloze':
        return (
          <FillBlankQuestion
            item={currentItem}
            answer={currentAnswer}
            onAnswerChange={(answer) => handleAnswerChange(currentItem.id, answer)}
          />
        );
      case 'translation':
        return (
          <TranslationQuestion
            item={currentItem}
            answer={currentAnswer}
            onAnswerChange={(answer) => handleAnswerChange(currentItem.id, answer)}
          />
        );
      default:
        return <Text>Unsupported question type</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressIndicator
          current={currentQuestionIndex + 1}
          total={test.items.length}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderQuestion()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          <Button
            title="Previous"
            onPress={handlePrevious}
            variant="outline"
            disabled={currentQuestionIndex === 0 || isSubmitting}
            style={styles.navButton}
          />
          {isLastQuestion ? (
            <Button
              title="Submit Test"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.navButton}
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              disabled={isSubmitting}
              style={styles.navButton}
            />
          )}
        </View>

        <Text style={styles.hint}>
          {isLastQuestion
            ? 'Review your answers or submit to see your results'
            : 'Answer and move to the next question'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default PlacementTestScreen;
