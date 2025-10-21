// src/screens/DashboardScreen.js
import React from 'react';
import { View, Text, SafeAreaView, TextInput, Button, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Import BlurView
import { useTasks } from '../context/TaskContext';
import Avatar from '../components/Avatar';
import StatsDisplay from '../components/StatsDisplay';

export default function DashboardScreen() {
  const {
    styles, colors, theme, themePreference, setThemePreference, userLevel, xpPercentage,
    xpAnim, userXP, LEVEL_UP_THRESHOLD, currentStreak, taskText, setTaskText,
    estimatedTime, setEstimatedTime, selectedDifficulty, setSelectedDifficulty,
    suggestedTime, addTask, completedTasks, longestStreak // Added longestStreak
  } = useTasks();

  // Use Alert instead of Button for a cleaner look maybe? Or a custom Button component
  const handleAddTask = () => {
    if (!taskText.trim()) {
      Alert.alert("Missing Task", "Please enter a task description.");
      return;
    }
    addTask();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{flex: 1}} // Use flex: 1 instead of styles.content
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }} // Apply padding here
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
      >
        <Text style={styles.title}>TaskHero</Text>
        <Text style={styles.quoteText}>"The secret of getting ahead is getting started."</Text>

        {/* Status Section */}
        <View style={styles.statusContainer}>
          <Avatar level={userLevel} />
          <View style={styles.levelStreakRow}>
            <Text style={styles.levelText}>Level: {userLevel}</Text>
            <View style={styles.streakContainer}>
              <Feather name="fire" size={20} color="#f59e0b" />
              <Text style={styles.streakText}>{currentStreak}</Text>
            </View>
          </View>
          <View style={styles.xpBarContainer}>
            <Animated.View style={[styles.xpBar, { width: xpPercentage }]} />
          </View>
          <Text style={styles.xpText}>{userXP} / {LEVEL_UP_THRESHOLD} XP</Text>
        </View>

        {/* Input Section Wrapper for Shadow/Layout */}
         <View style={[styles.inputSection, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]}>
           {/* BlurView provides the glass background */}
           <BlurView
             intensity={Platform.OS === 'ios' ? 70 : 100}
             tint={colors.theme}
             style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder }}
           >
             {/* Content inside the BlurView */}
             <View style={styles.inputSectionContent}>
               <View style={styles.inputRow}>
                 <TextInput
                   style={styles.taskInput}
                   placeholder="Enter a new task..."
                   value={taskText}
                   onChangeText={setTaskText}
                   placeholderTextColor={colors.placeholder}
                 />
                 <TextInput
                   style={styles.timeInput}
                   placeholder="Mins"
                   keyboardType="numeric"
                   value={estimatedTime}
                   onChangeText={setEstimatedTime}
                   placeholderTextColor={colors.placeholder}
                 />
               </View>
               <View style={styles.difficultySelector}>
                 <TouchableOpacity style={[styles.difficultyButton, selectedDifficulty === 'easy' && styles.selectedEasy]} onPress={() => setSelectedDifficulty('easy')}><Text style={styles.difficultyButtonText}>Easy</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.difficultyButton, selectedDifficulty === 'medium' && styles.selectedMedium]} onPress={() => setSelectedDifficulty('medium')}><Text style={styles.difficultyButtonText}>Medium</Text></TouchableOpacity>
                 <TouchableOpacity style={[styles.difficultyButton, selectedDifficulty === 'hard' && styles.selectedHard]} onPress={() => setSelectedDifficulty('hard')}><Text style={styles.difficultyButtonText}>Hard</Text></TouchableOpacity>
               </View>
               <View style={styles.suggestionContainer}>
                 <Feather name="clock" size={16} color="#4338ca" />
                 <Text style={styles.suggestionText}>
                   Suggest Start: {suggestedTime ? suggestedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now'}
                 </Text>
               </View>
               <View style={styles.themeToggleContainer}>
                 <TouchableOpacity style={[styles.themeButton, themePreference === 'light' && styles.themeButtonActive]} onPress={() => setThemePreference('light')}>
                   <Feather name="sun" size={18} color={themePreference === 'light' ? colors.primary : colors.secondaryText} />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.themeButton, themePreference === 'system' && styles.themeButtonActive]} onPress={() => setThemePreference('system')}>
                   <Feather name="smartphone" size={18} color={themePreference === 'system' ? colors.primary : colors.secondaryText} />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.themeButton, themePreference === 'dark' && styles.themeButtonActive]} onPress={() => setThemePreference('dark')}>
                   <Feather name="moon" size={18} color={themePreference === 'dark' ? colors.primary : colors.secondaryText} />
                 </TouchableOpacity>
               </View>
               {/* Consider using a custom button component */}
               <Button title="Add Task" onPress={handleAddTask} color={colors.primary} />
            </View>
          </BlurView>
        </View>

        <StatsDisplay completedTasks={completedTasks} />
      </ScrollView>
    </SafeAreaView>
  );
}