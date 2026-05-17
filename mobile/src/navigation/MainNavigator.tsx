/**
 * Main Navigator
 * Handles navigation for authenticated users with bottom tabs
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { RoadmapScreen, ModuleDetailScreen } from '../screens/main';
import { TaskListScreen, TaskDetailScreen, TaskFeedbackScreen } from '../screens/tasks';
import {
  ScenarioSelectionScreen,
  ScenarioIntroScreen,
  DialogueChatScreen,
  DialogueCompletionScreen,
} from '../screens/dialogue';
import { ProgressOverviewScreen, LeaderboardScreen } from '../screens/progress';
import { ProfileScreen } from '../screens/profile';
import { TranslatorScreen } from '../screens/translator';
import { FriendsSearchScreen } from '../screens/friends';
import { TaskAttempt, DialogueScenario, DialogueSession, Achievement } from '../types';

export type HomeStackParamList = {
  Roadmap: undefined;
  ModuleDetail: {
    moduleId: number;
  };
  TaskList: {
    moduleId: number;
    moduleTitle: string;
  };
  TaskDetail: {
    taskId: number;
    moduleId: number;
  };
  TaskFeedback: {
    attempt: TaskAttempt;
    taskId: number;
    moduleId: number;
    newlyEarnedAchievements?: Achievement[];
  };
  ScenarioSelection: undefined;
  ScenarioIntro: {
    scenario: DialogueScenario;
  };
  DialogueChat: {
    session: DialogueSession;
  };
  DialogueCompletion: {
    session: DialogueSession;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Translator: undefined;
  Progress: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type LeaderboardStackParamList = {
  LeaderboardHome: undefined;
  FriendsSearch: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LeaderboardStack = createNativeStackNavigator<LeaderboardStackParamList>();

// Home Stack Navigator with Roadmap, Module, and Task screens
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Roadmap"
        component={RoadmapScreen}
        options={{
          title: 'My Learning Path',
          headerLargeTitle: true,
        }}
      />
      <HomeStack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={{
          title: 'Module Details',
          headerBackTitle: 'Back',
        }}
      />
      <HomeStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Practice Tasks',
          headerBackTitle: 'Back',
        }}
      />
      <HomeStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'Task',
          headerBackTitle: 'Back',
        }}
      />
      <HomeStack.Screen
        name="TaskFeedback"
        component={TaskFeedbackScreen}
        options={{
          title: 'Feedback',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
      <HomeStack.Screen
        name="ScenarioSelection"
        component={ScenarioSelectionScreen}
        options={{
          title: 'Dialogue Practice',
          headerBackTitle: 'Back',
        }}
      />
      <HomeStack.Screen
        name="ScenarioIntro"
        component={ScenarioIntroScreen}
        options={{
          title: 'Scenario Details',
          headerBackTitle: 'Back',
        }}
      />
      <HomeStack.Screen
        name="DialogueChat"
        component={DialogueChatScreen}
        options={{
          title: 'Conversation',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
      <HomeStack.Screen
        name="DialogueCompletion"
        component={DialogueCompletionScreen}
        options={{
          title: 'Session Complete',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
    </HomeStack.Navigator>
  );
};

// Progress screen is a direct component (no stack needed for now)
const ProgressScreen = ProgressOverviewScreen;

const LeaderboardStackNavigator = () => {
  return (
    <LeaderboardStack.Navigator>
      <LeaderboardStack.Screen
        name="LeaderboardHome"
        component={LeaderboardScreen}
        options={({ navigation }) => ({
          title: 'Leaderboard',
          headerRight: () => (
            <Text
              onPress={() => navigation.navigate('FriendsSearch')}
              style={{ fontSize: 22, marginRight: 12, color: '#2196F3' }}
            >
              ➕
            </Text>
          ),
        })}
      />
      <LeaderboardStack.Screen
        name="FriendsSearch"
        component={FriendsSearchScreen}
        options={{ title: 'Find Friends', headerBackTitle: 'Back' }}
      />
    </LeaderboardStack.Navigator>
  );
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Roadmap',
          headerShown: false, // Hide tab header since stack has its own
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Translator"
        component={TranslatorScreen}
        options={{
          title: 'Translate',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🌐</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardStackNavigator}
        options={{
          title: 'Leaderboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏆</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
