// src/components/StatsDisplay.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTasks } from '../context/TaskContext';

const isDateInThisWeek = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() + 6));
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

const StatsDisplay = ({ completedTasks }) => {
  const { styles, colors, longestStreak } = useTasks(); // Get styles, colors, longestStreak

  const totalXP = completedTasks.reduce((sum, task) => sum + task.xpAwarded, 0);
  const tasksThisWeek = completedTasks.filter(task =>
    task.completedAt && isDateInThisWeek(new Date(task.completedAt)) // Added check for completedAt
  ).length;

  return (
    // Use inputSection style for consistent card appearance
    <View style={[styles.inputSection, { marginBottom: 20 }]}>
      <Text style={[styles.title, { fontSize: 20, marginBottom: 10, color: colors.text }]}>Your Stats</Text>
      <View style={localStyles.statRow}>
        <View style={localStyles.statBox}>
          <Text style={[localStyles.statValue, { color: colors.primary }]}>{tasksThisWeek}</Text>
          <Text style={[localStyles.statLabel, { color: colors.secondaryText }]}>Tasks This Week</Text>
        </View>
        <View style={localStyles.statBox}>
          <Text style={[localStyles.statValue, { color: colors.primary }]}>{totalXP}</Text>
          <Text style={[localStyles.statLabel, { color: colors.secondaryText }]}>Total XP Gained</Text>
        </View>
         <View style={localStyles.statBox}>
          <Text style={[localStyles.statValue, { color: colors.primary }]}>{longestStreak}</Text>
          <Text style={[localStyles.statLabel, { color: colors.secondaryText }]}>Longest Streak</Text>
        </View>
      </View>
    </View>
  );
};

// Local styles specific to this component
const localStyles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 5, // Reduced padding
  },
  statValue: {
    fontSize: 22, // Slightly smaller
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12, // Slightly smaller
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StatsDisplay;