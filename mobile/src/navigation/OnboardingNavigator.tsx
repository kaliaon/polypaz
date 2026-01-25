/**
 * Onboarding Navigator
 * Handles navigation for onboarding flow after registration
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  TargetLanguageScreen,
  NativeLanguageScreen,
  LearningPreferencesScreen,
} from '../screens/onboarding';
import {
  PlacementIntroScreen,
  PlacementTestScreen,
  PlacementResultsScreen,
} from '../screens/placement';
import { Language, PlacementTestResult } from '../types';

export type OnboardingStackParamList = {
  TargetLanguage: undefined;
  NativeLanguage: {
    targetLanguage: Language;
  };
  LearningPreferences: {
    targetLanguage: Language;
    nativeLanguage: Language;
  };
  PlacementIntro: {
    testId: number;
    language: Language;
  };
  PlacementTest: {
    testId: number;
    language: Language;
  };
  PlacementResults: {
    result: PlacementTestResult;
    language: Language;
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TargetLanguage"
        component={TargetLanguageScreen}
        options={{
          title: 'Choose Language',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="NativeLanguage"
        component={NativeLanguageScreen}
        options={{
          title: 'Native Language',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="LearningPreferences"
        component={LearningPreferencesScreen}
        options={{
          title: 'Learning Preferences',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PlacementIntro"
        component={PlacementIntroScreen}
        options={{
          title: 'Placement Test',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PlacementTest"
        component={PlacementTestScreen}
        options={{
          title: 'Placement Test',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="PlacementResults"
        component={PlacementResultsScreen}
        options={{
          title: 'Results',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
}
