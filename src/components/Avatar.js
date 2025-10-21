// src/components/Avatar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AVATAR_EMOJIS = ['🌱', '🧑‍🎓', '🦸', '🧙', '🚀', '🌟'];

const Avatar = ({ level }) => {
  const avatarIndex = Math.min(level - 1, AVATAR_EMOJIS.length - 1);
  const avatarEmoji = AVATAR_EMOJIS[avatarIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{avatarEmoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, borderWidth: 3, borderColor: '#3b82f6',
  },
  emoji: { fontSize: 40, },
});

export default Avatar;