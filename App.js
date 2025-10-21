// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Import BlurView here
import { StyleSheet, Platform } from 'react-native'; // Import StyleSheet & Platform

// Import Provider and Hook from context
import { TaskProvider, useTasks } from './src/context/TaskContext';
// Import Screens
import DashboardScreen from './src/screens/DashboardScreen';
import TasksScreen from './src/screens/TasksScreen';

const Tab = createBottomTabNavigator();

// Component to render the tabs, using context for styling
function AppTabs() {
  const { colors, theme } = useTasks(); // Get theme info from context
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'check-square' : 'check-square';
          }
          iconName = iconName || 'help-circle'; // Fallback
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: 'transparent', // Make default background transparent
          position: 'absolute', // Make it float
          borderTopWidth: 0, // Remove top border
          elevation: 0, // Remove Android shadow
          height: 70, // Increase height
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarBackground: () => ( // Add BlurView as tab bar background
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint={theme} // Use theme from context
            style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderTopLeftRadius: 20, borderTopRightRadius: 20 }]} // Apply blur to fill and round corners
          />
        ),
        tabBarLabelStyle: {
           fontSize: 12,
           marginBottom: 5, // Adjust label position
        },
        headerShown: false, // Use titles within screens
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}

// Main App: Wraps everything in the Provider
export default function App() {
  return (
    <TaskProvider>
      <AppWrapper />
    </TaskProvider>
  );
}

// Wrapper needed to access context for StatusBar styling
function AppWrapper() {
  const { theme } = useTasks(); // Get theme from context
  return (
    <NavigationContainer>
      <AppTabs />
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
    </NavigationContainer>
  );
}