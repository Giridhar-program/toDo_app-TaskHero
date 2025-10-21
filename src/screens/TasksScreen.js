// src/screens/TasksScreen.js
import React from 'react';
import { View, Text, SafeAreaView, Animated, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTasks } from '../context/TaskContext';

export default function TasksScreen() {
  const {
    styles, colors, tasks, now, completeTask,
  } = useTasks();

  // Filter out any potentially undefined tasks just in case
  const validTasks = tasks.filter(task => task && task.id);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        // Use container style for background, content for padding
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }} // Apply padding here
        data={validTasks} // Use filtered tasks
        renderItem={({ item }) => {
          // Add defensive checks for dates
          const startTime = item.scheduledTime ? new Date(item.scheduledTime) : new Date();
          const endTime = item.endTime ? new Date(item.endTime) : new Date(startTime.getTime() + (item.estimatedTime || 0) * 60000);

          let itemStyle = [styles.taskItem];
          let blurTintColor = colors.theme;

          if (now > endTime) {
            itemStyle.push(styles.taskOverdue);
          } else if (now >= startTime && now <= endTime) {
            itemStyle.push(styles.taskInProgress);
          }

          return (
            <View style={itemStyle}>
              <BlurView
                intensity={Platform.OS === 'ios' ? 70 : 100}
                tint={blurTintColor}
                style={styles.taskItemBlur}
              >
                <View style={styles.taskItemContent}>
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskText}>{item.title || 'Untitled Task'}</Text>
                    <Text style={styles.taskMeta}>
                      Scheduled: {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · Est: {item.estimatedTime || '?'} mins
                    </Text>
                    <Text style={styles.taskMeta}>
                      Difficulty: {item.difficulty || 'N/A'} (+{item.xpAwarded || 0} XP)
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => completeTask(item)} style={styles.completeButton}>
                    <Feather name="check" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          );
        }}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <Text style={[styles.title, { fontSize: 24, marginBottom: 15 }]}>Active Tasks</Text>
        )}
        ListEmptyComponent={() => (
           <View style={{alignItems: 'center', marginTop: 50}}>
             <Text style={{fontSize: 16, color: colors.secondaryText}}>No active tasks! Add one from the Dashboard.</Text>
           </View>
        )}
      />
    </SafeAreaView>
  );
}