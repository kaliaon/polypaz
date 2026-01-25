/**
 * Main App Navigator
 * Handles navigation between authenticated and unauthenticated flows
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { LoadingSpinner } from '../components';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking authentication state
  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Check if user needs onboarding (authenticated but no target language set)
  const needsOnboarding =
    isAuthenticated &&
    user &&
    (!user.profile?.target_language ||
      !user.profile?.learning_preferences?.onboarding_completed);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
