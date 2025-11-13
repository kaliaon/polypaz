/**
 * Main Navigator
 * Handles navigation for authenticated users with bottom tabs
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

export type MainTabParamList = {
  Home: undefined;
  Practice: undefined;
  Dialogue: undefined;
  Progress: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens - will be replaced with actual components
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Roadmap / Home Screen</Text>
  </View>
);

const PracticeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Practice / Tasks Screen</Text>
  </View>
);

const DialogueScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Dialogue Screen</Text>
  </View>
);

const ProgressScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Progress Dashboard Screen</Text>
  </View>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Roadmap' }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ title: 'Practice' }}
      />
      <Tab.Screen
        name="Dialogue"
        component={DialogueScreen}
        options={{ title: 'Dialogue' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
    </Tab.Navigator>
  );
}
