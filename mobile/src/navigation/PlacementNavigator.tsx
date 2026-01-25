/**
 * Placement Test Navigator
 * Handles navigation for placement test flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PlacementIntroScreen,
  PlacementTestScreen,
  PlacementResultsScreen,
} from '../screens/placement';
import { Language, PlacementTestResult } from '../types';

export type PlacementStackParamList = {
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

const Stack = createNativeStackNavigator<PlacementStackParamList>();

export default function PlacementNavigator() {
  return (
    <Stack.Navigator>
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
          headerBackTitle: 'Back',
          headerBackVisible: false, // Prevent going back during test
        }}
      />
      <Stack.Screen
        name="PlacementResults"
        component={PlacementResultsScreen}
        options={{
          title: 'Results',
          headerBackVisible: false, // Prevent going back to test
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
}
