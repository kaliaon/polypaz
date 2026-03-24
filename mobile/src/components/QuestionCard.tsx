/**
 * Question Card Components
 * Displays different types of placement test questions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Input } from './Input';
import { PlacementTestItem } from '../types';

interface MultipleChoiceQuestionProps {
  item: PlacementTestItem;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
}

const extractQuestionText = (qt: string | Record<string, string>): string => {
  if (typeof qt === 'string') return qt;
  // Try common keys, then fall back to first available value
  return qt.question || qt.text || qt.en || qt.kk || qt.ru || qt.es || Object.values(qt)[0] || '';
};

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  item,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const questionText = extractQuestionText(item.question_text);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questionText}</Text>

      <View style={styles.optionsContainer}>
        {item.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              selectedAnswer === option && styles.optionCardSelected,
            ]}
            onPress={() => onAnswerSelect(option)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.optionRadio,
                selectedAnswer === option && styles.optionRadioSelected,
              ]}
            >
              {selectedAnswer === option && (
                <View style={styles.optionRadioInner} />
              )}
            </View>
            <Text
              style={[
                styles.optionText,
                selectedAnswer === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface FillBlankQuestionProps {
  item: PlacementTestItem;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  item,
  answer,
  onAnswerChange,
}) => {
  const questionText = extractQuestionText(item.question_text);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questionText}</Text>
      <Text style={styles.instruction}>Fill in the blank:</Text>

      <Input
        value={answer}
        onChangeText={onAnswerChange}
        placeholder="Type your answer here"
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

interface TranslationQuestionProps {
  item: PlacementTestItem;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export const TranslationQuestion: React.FC<TranslationQuestionProps> = ({
  item,
  answer,
  onAnswerChange,
}) => {
  const questionText = extractQuestionText(item.question_text);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questionText}</Text>
      <Text style={styles.instruction}>Translate this phrase:</Text>

      <Input
        value={answer}
        onChangeText={onAnswerChange}
        placeholder="Type your translation here"
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        numberOfLines={3}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    lineHeight: 28,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: '#2196F3',
  },
  optionRadioInner: {
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
    color: '#2196F3',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 0,
  },
});
