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
import { ProgressOverviewScreen } from '../screens/progress';
import { ProfileScreen } from '../screens/profile';
import { TaskAttempt, DialogueScenario, DialogueSession } from '../types';

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
  };
};

export type DialogueStackParamList = {
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
  Dialogue: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DialogueStack = createNativeStackNavigator<DialogueStackParamList>();

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
    </HomeStack.Navigator>
  );
};

// Dialogue Stack Navigator with scenario and chat screens
const DialogueStackNavigator = () => {
  return (
    <DialogueStack.Navigator>
      <DialogueStack.Screen
        name="ScenarioSelection"
        component={ScenarioSelectionScreen}
        options={{
          title: 'Dialogue Practice',
          headerLargeTitle: true,
        }}
      />
      <DialogueStack.Screen
        name="ScenarioIntro"
        component={ScenarioIntroScreen}
        options={{
          title: 'Scenario Details',
          headerBackTitle: 'Back',
        }}
      />
      <DialogueStack.Screen
        name="DialogueChat"
        component={DialogueChatScreen}
        options={{
          title: 'Conversation',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
      <DialogueStack.Screen
        name="DialogueCompletion"
        component={DialogueCompletionScreen}
        options={{
          title: 'Session Complete',
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
    </DialogueStack.Navigator>
  );
};

// Progress screen is a direct component (no stack needed for now)
const ProgressScreen = ProgressOverviewScreen;

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
        name="Dialogue"
        component={DialogueStackNavigator}
        options={{
          title: 'Dialogue',
          headerShown: false, // Hide tab header since stack has its own
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💬</Text>
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
