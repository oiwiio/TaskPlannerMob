import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Task } from '../utils/parser';
import { colors, radius, spacing } from '../constants/theme';

//Types

interface Props {
  task:       Task;
  onToggle:   (id: string) => void;
  onDelete:   (id: string) => void;
}

//Helpers

function priorityLabel(p: Task['priority']): string {
  if (p === 'high') return '🔴 Высокий';
  if (p === 'low')  return '⚪ Низкий';
  return '🟡 Средний';
}

const PRIORITY_BAR_COLOR: Record<Task['priority'], string> = {
  high: colors.red,
  mid:  colors.yellow,
  low:  colors.border2,
};

const PRIORITY_BADGE: Record<Task['priority'], { bg: string; text: string; border: string }> = {
  high: { bg: colors.redBg,    text: colors.red,    border: colors.redBorder },
  mid:  { bg: colors.yellowBg, text: colors.yellow, border: colors.yellowBorder },
  low:  { bg: colors.surface2, text: colors.muted,  border: colors.border },
};

//Component

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const priorityBadge = PRIORITY_BADGE[task.priority];

  return (
    <View style={[styles.card, task.done && styles.cardDone]}>

      {/* Priority bar */}
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_BAR_COLOR[task.priority] }]} />

      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, task.done && styles.checkboxDone]}
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        {task.done && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={3}>
          {task.title}
        </Text>

        <View style={styles.meta}>
          {/* Date */}
          <View style={[styles.badge, { backgroundColor: colors.blueBg, borderColor: colors.blueBorder }]}>
            <Text style={[styles.badgeText, { color: colors.blue }]}>
              📅 {task.dateLabel}
            </Text>
          </View>

          {/* Time */}
          {task.time && (
            <View style={[styles.badge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Text style={[styles.badgeText, { color: colors.muted }]}>
                ⏰ {task.time}
              </Text>
            </View>
          )}

          {/* Priority */}
          <View style={[styles.badge, { backgroundColor: priorityBadge.bg, borderColor: priorityBadge.border }]}>
            <Text style={[styles.badgeText, { color: priorityBadge.text }]}>
              {priorityLabel(task.priority)}
            </Text>
          </View>

          {/* Category */}
          <View style={[styles.badge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.muted }]}>
              {task.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task.id)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>

    </View>
  );
}

//Styles

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    radius.md,
    padding:         spacing.md,
    paddingLeft:     spacing.md + 6, // room for priority bar
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             spacing.sm + 2,
    marginBottom:    spacing.sm,
    overflow:        'hidden',
  },
  cardDone: {
    opacity: 0.45,
  },

  priorityBar: {
    position:     'absolute',
    left:         0,
    top:          12,
    bottom:       12,
    width:        3,
    borderRadius: 2,
  },

  checkbox: {
    width:           20,
    height:          20,
    borderRadius:    6,
    borderWidth:     1.5,
    borderColor:     colors.border2,
    backgroundColor: 'transparent',
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       1,
    flexShrink:      0,
  },
  checkboxDone: {
    backgroundColor: colors.accent,
    borderColor:     colors.accent,
  },
  checkmark: {
    color:    '#fff',
    fontSize: 11,
    lineHeight: 14,
  },

  body: {
    flex:     1,
    minWidth: 0,
  },
  title: {
    fontSize:    15,
    fontWeight:  '500',
    color:       colors.text,
    lineHeight:  21,
    marginBottom: spacing.xs + 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color:              colors.muted,
  },

  meta: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
    borderWidth:       1,
  },
  badgeText: {
    fontSize:   11,
    fontWeight: '600',
  },

  deleteBtn: {
    padding:    2,
    marginTop:  1,
    flexShrink: 0,
  },
  deleteText: {
    fontSize: 20,
    color:    colors.muted,
    lineHeight: 22,
  },
});
