// src/context/TaskContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  UIManager,
  Platform,
  LayoutAnimation,
  Alert,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// --- Enable LayoutAnimation for Android ---
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- CONSTANTS ---
const XP_VALUES = { easy: 10, medium: 25, hard: 50 };
const LEVEL_UP_THRESHOLD = 100;
const STORAGE_KEY = '@TaskHeroData';

// --- HELPER FUNCTIONS ---
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1); // Ensure they are Date objects
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const isYesterday = (date1, date2) => {
  if (!date1 || !date2) return false;
  const today = new Date(date1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(yesterday, new Date(date2));
};

// --- COLOR PALETTES ---
const lightColors = {
  background: '#F7F8FA',
  cardBackground: 'rgba(255, 255, 255, 0.75)', // Glass effect
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  inputBackground: 'rgba(255, 255, 255, 0.5)',
  text: '#212121',
  textSecondary: '#757575',
  primary: '#6A85FF',
  primaryText: '#FFFFFF',
  border: '#E0E0E0',
  placeholder: '#9E9E9E',
  theme: 'light',
};

const darkColors = {
  background: '#121212',
  cardBackground: 'rgba(30, 30, 30, 0.7)', // Glass effect
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  inputBackground: 'rgba(50, 50, 50, 0.6)',
  text: '#E0E0E0',
  textSecondary: '#BDBDBD',
  primary: '#8A9EFF',
  primaryText: '#FFFFFF',
  border: '#424242',
  placeholder: '#757575',
  theme: 'dark',
};

// --- STYLES FUNCTION ---
const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, flex: 1 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: colors.primary },
  quoteText: { fontSize: 16, fontStyle: 'italic', color: colors.secondaryText, textAlign: 'center', marginBottom: 20, },
  statusContainer: { marginBottom: 20, alignItems: 'center' },
  levelStreakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 5, },
  levelText: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  streakContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: '#f59e0b', },
  streakText: { fontSize: 18, fontWeight: 'bold', color: '#d97706', marginLeft: 6, },
  xpBarContainer: { height: 20, width: '100%', backgroundColor: colors.inputBackground, borderRadius: 10, marginTop: 10, overflow: 'hidden' }, // Use inputBackground for contrast
  xpBar: { height: '100%', backgroundColor: '#22c55e' },
  xpText: { fontSize: 14, color: colors.secondaryText, marginTop: 2 },
  inputSection: { // Can also have a slight glass effect
    backgroundColor: Platform.OS === 'android' ? colors.cardBackground : 'transparent', // Android fallback
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden', // Needed if wrapping with BlurView
    borderWidth: 1,
    borderColor: colors.cardBorder,
    // Add shadow via a wrapper View if using BlurView inside
  },
  inputSectionContent: { // Content inside the inputSection BlurView/View
    backgroundColor: Platform.OS === 'android' ? 'transparent' : colors.cardBackground, // iOS needs background here if BlurView is wrapper
    padding: 15,
  },
  inputRow: { flexDirection: 'row', marginBottom: 10, },
  taskInput: { flex: 1, borderColor: colors.border, color: colors.text, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 12 : 8, marginRight: 10, backgroundColor: colors.inputBackground, }, // Adjusted padding
  timeInput: { width: 70, borderColor: colors.border, color: colors.text, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 12 : 8, backgroundColor: colors.inputBackground, textAlign: 'center', }, // Adjusted padding
  difficultySelector: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10, },
  difficultyButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground },
  difficultyButtonText: { fontWeight: '600', color: colors.textSecondary },
  selectedEasy: { backgroundColor: 'rgba(220, 252, 231, 0.8)', borderColor: '#22c55e' }, // Semi-transparent highlights
  selectedMedium: { backgroundColor: 'rgba(254, 249, 195, 0.8)', borderColor: '#f59e0b' },
  selectedHard: { backgroundColor: 'rgba(254, 226, 226, 0.8)', borderColor: '#ef4444' },
  suggestionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: 'rgba(238, 242, 255, 0.7)', borderRadius: 6, marginBottom: 10, }, // Semi-transparent
  suggestionText: { color: '#4338ca', fontWeight: '600', },
  themeToggleContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.inputBackground, borderRadius: 25, marginBottom: 15, padding: 4 }, // Added padding
  themeButton: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 20, }, // Add borderRadius
  themeButtonActive: { backgroundColor: colors.background, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, }, // Use background, add elevation/shadow

  // --- Task Item Styles ---
  taskItem: { // Container for shadow
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: Platform.OS === 'android' ? colors.cardBackground : 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  taskItemBlur: { // Style for the BlurView
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  taskItemContent: { // Style for content inside BlurView
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInProgress: { borderColor: '#FFD700', }, // Apply border to outer View
  taskOverdue: { borderColor: '#FF6B6B', opacity: 0.9, }, // Apply border to outer View
  taskDetails: { flex: 1, marginRight: 10 },
  taskText: { fontSize: 16, fontWeight: '600', color: colors.text },
  taskMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  completeButton: {
     backgroundColor: colors.primary,
     width: 40, height: 40,
     borderRadius: 10,
     justifyContent: 'center', alignItems: 'center',
     elevation: 2,
  },
});

// --- NOTIFICATION HANDLER ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

// --- CONTEXT ---
const TaskContext = createContext();

// --- PROVIDER ---
export const TaskProvider = ({ children }) => {
  // --- State ---
  const [taskText, setTaskText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [now, setNow] = useState(new Date());
  const [themePreference, setThemePreference] = useState('system');
  const xpAnim = useRef(new Animated.Value(0)).current;

  // --- Theme ---
  const systemTheme = useColorScheme() || 'light';
  const theme = themePreference === 'system' ? systemTheme : themePreference;
  const colors = theme === 'light' ? lightColors : darkColors;
  const styles = getStyles(colors);

  // --- useEffects ---
  useEffect(() => {
    const registerForNotifications = async () => {
      try { // Added try/catch
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissions needed', 'Notifications are disabled. Please enable them in settings if you want reminders.');
        }
      } catch (e) {
        console.error("Error requesting notification permissions", e);
        Alert.alert('Error', 'Could not request notification permissions.');
      }
    };
    registerForNotifications();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData !== null) {
          const parsedData = JSON.parse(storedData);
          const loadedXP = parsedData.userXP || 0;
          setTasks(parsedData.tasks || []);
          setCompletedTasks(parsedData.completedTasks || []);
          setCurrentStreak(parsedData.currentStreak || 0);
          setLongestStreak(parsedData.longestStreak || 0);
          setUserLevel(parsedData.userLevel || 1);
          setUserXP(loadedXP);
          setThemePreference(parsedData.themePreference || 'system');
          xpAnim.setValue(loadedXP); // Set initial value directly
        }
      } catch (error) { console.error('Failed to load data from storage', error); }
      finally { setIsDataLoaded(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;
    const saveData = async () => {
      try {
        const dataToStore = JSON.stringify({ tasks, userLevel, userXP, completedTasks, currentStreak, longestStreak, themePreference });
        await AsyncStorage.setItem(STORAGE_KEY, dataToStore);
      } catch (error) { console.error('Failed to save data to storage', error); }
    };
    saveData();
  }, [tasks, userLevel, userXP, completedTasks, currentStreak, longestStreak, themePreference, isDataLoaded]);

  useEffect(() => {
    const activeTasks = tasks.filter(t => !t.completed); // Filter only active tasks for scheduling
    const lastEndTime = activeTasks.reduce((latest, task) => {
      if (task.endTime) {
        const taskEndTime = new Date(task.endTime);
        // Ensure the latest time is actually in the future compared to now
        const currentTime = new Date();
        if (taskEndTime > currentTime && taskEndTime > latest) {
            return taskEndTime;
        }
      }
      return latest;
    }, new Date()); // Start reduce with current time

    setSuggestedTime(lastEndTime < new Date() ? new Date() : lastEndTime); // Ensure suggested time is not in the past
  }, [tasks]);


  useEffect(() => {
    // Only animate if data is loaded to prevent initial jump
    if (isDataLoaded) {
       Animated.timing(xpAnim, {
         toValue: userXP,
         duration: 500,
         useNativeDriver: false,
       }).start();
    }
  }, [userXP, isDataLoaded]);

  useEffect(() => {
    const timer = setInterval(() => { setNow(new Date()); }, 60000); // Update every minute
    return () => clearInterval(timer); // Cleanup interval on unmount
  }, []);

  // --- Functions ---
  const addTask = async () => {
    if (taskText.trim().length === 0 || !suggestedTime) return;
    const duration = parseInt(estimatedTime) || 30; // Default to 30 mins if invalid
    const startTime = suggestedTime < new Date() ? new Date() : suggestedTime; // Ensure start time isn't past
    const endTime = new Date(startTime.getTime() + duration * 60000);
    let notificationId = null;
    try {
      // Schedule notification slightly before start time
      const triggerTime = new Date(startTime.getTime() - 1 * 60000); // 1 minute before
       if (triggerTime > new Date()) { // Only schedule if trigger is in the future
           notificationId = await Notifications.scheduleNotificationAsync({
               content: { title: "🔔 Task Starting Soon!", body: taskText },
               trigger: triggerTime,
           });
       }
    } catch (e) { console.error("Failed to schedule notification", e); }

    const newTask = {
      id: Math.random().toString(), title: taskText, difficulty: selectedDifficulty,
      completed: false, xpAwarded: XP_VALUES[selectedDifficulty], estimatedTime: duration,
      scheduledTime: startTime.toISOString(), endTime: endTime.toISOString(), // Use adjusted start time
      notificationId: notificationId,
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(currentTasks => [...currentTasks, newTask].sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))); // Sort tasks by time
    setTaskText('');
    setEstimatedTime('');
  };

  const completeTask = async (taskToComplete) => {
    if (taskToComplete.notificationId) {
      try { await Notifications.cancelScheduledNotificationAsync(taskToComplete.notificationId); }
      catch (e) { console.error("Failed to cancel notification", e); }
    }

    let newXP = userXP + taskToComplete.xpAwarded;
    let newLevel = userLevel;
    let didLevelUp = false; // Flag to check if level up occurred

    if (newXP >= LEVEL_UP_THRESHOLD) {
      const levelsGained = Math.floor(newXP / LEVEL_UP_THRESHOLD);
      newLevel += levelsGained;
      newXP %= LEVEL_UP_THRESHOLD;
      didLevelUp = true;

      // Animate to full bar
      Animated.timing(xpAnim, {
        toValue: LEVEL_UP_THRESHOLD,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // After animation, reset bar and set final state
        xpAnim.setValue(0); // Reset visually first
         // Then animate to the newXP value
        setUserLevel(newLevel);
        setUserXP(newXP); // This will trigger the useEffect animation
         Alert.alert("Level Up!", `Congratulations! You've reached Level ${newLevel}! 🎉`);
      });
    } else {
       // Only update state if no level up animation is happening
       setUserLevel(newLevel); // Level might not change, but good practice
       setUserXP(newXP); // This triggers the useEffect animation
    }


    const completedTime = new Date();
    const newCompletedTask = { ...taskToComplete, completedAt: completedTime.toISOString() };
    const lastCompleted = completedTasks.length > 0 ? new Date(completedTasks[completedTasks.length - 1].completedAt) : null;
    let newStreak = currentStreak;
    let newLongestStreak = longestStreak;
    if (!lastCompleted) { newStreak = 1; }
    else if (isSameDay(completedTime, lastCompleted)) { /* no change */ }
    else if (isYesterday(completedTime, lastCompleted)) { newStreak += 1; }
    else { newStreak = 1; }
    if (newStreak > newLongestStreak) { newLongestStreak = newStreak; }
    setCurrentStreak(newStreak);
    setLongestStreak(newLongestStreak);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedTasks(prev => [...prev, newCompletedTask]);
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskToComplete.id));
  };


  const xpPercentage = xpAnim.interpolate({
    inputRange: [0, LEVEL_UP_THRESHOLD],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp', // Prevent bar exceeding 100% during animation
  });

  // --- Value ---
  const value = {
    tasks, completedTasks, userLevel, userXP, currentStreak, longestStreak, // Added longestStreak
    isDataLoaded, now, suggestedTime, taskText, selectedDifficulty, estimatedTime, themePreference,
    setTaskText, setSelectedDifficulty, setEstimatedTime, setThemePreference,
    addTask, completeTask,
    styles, colors, theme, xpPercentage, xpAnim, LEVEL_UP_THRESHOLD
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// --- Hook ---
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};