import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';

import { TaskProvider, useTasks } from './src/context/TaskContext';
import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { colors, theme } = useTasks();

  const tabBarBackgroundColor =
    theme === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(18, 18, 18, 0.3)';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Tasks') iconName = 'check-square';

          return (
            <Feather
              name={iconName}
              size={focused ? size + 2 : size}
              color={focused ? colors.primary : colors.secondaryText}
              style={{
                shadowColor: colors.primary,
                shadowOpacity: focused ? 0.25 : 0,
                shadowRadius: 6,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 75,
          marginHorizontal: 20,
          borderRadius: 25,
          bottom: 20,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              borderRadius: 25,
              overflow: 'hidden',
              backgroundColor: tabBarBackgroundColor,
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 100}
              tint={theme}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 8,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppWrapper />
    </TaskProvider>
  );
}

function AppWrapper() {
  const { theme } = useTasks();

  return (
    <NavigationContainer>
      <AppTabs />
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
    </NavigationContainer>
  );
}
