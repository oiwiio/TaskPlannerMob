import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function EmptyState() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>✦</Text>
      <Text style={styles.text}>
        Задач пока нет.{'\n'}Введите текст выше и нажмите «Разобрать».
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems:  'center',
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize:     36,
    opacity:      0.3,
    marginBottom: spacing.md,
    color:        colors.text,
  },
  text: {
    fontSize:  14,
    color:     colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
