import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Task, Priority } from '../utils/parser';
import { colors, radius, spacing } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  task:     Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Task>) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'high', label: '🔴 Высокий' },
  { key: 'mid',  label: '🟡 Средний' },
  { key: 'low',  label: '⚪ Низкий' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: Props) {
  const priorityBadge = PRIORITY_BADGE[task.priority];

  const [modalVisible, setModalVisible] = useState(false);

  // Local draft state — only touches real task on confirmed save
  const [draftTitle,      setDraftTitle]      = useState(task.title);
  const [draftDateLabel,  setDraftDateLabel]  = useState(task.dateLabel);
  const [draftTime,       setDraftTime]       = useState(task.time ?? '');
  const [draftPriority,   setDraftPriority]   = useState<Priority>(task.priority);
  const [draftCategory,   setDraftCategory]   = useState(task.category);

  function openModal() {
    // reset draft to current task values every time it opens
    setDraftTitle(task.title);
    setDraftDateLabel(task.dateLabel);
    setDraftTime(task.time ?? '');
    setDraftPriority(task.priority);
    setDraftCategory(task.category);
    setModalVisible(true);
  }

  function hasChanges(): boolean {
    return (
      draftTitle.trim()     !== task.title ||
      draftDateLabel.trim() !== task.dateLabel ||
      (draftTime.trim() || null) !== task.time ||
      draftPriority         !== task.priority ||
      draftCategory.trim()  !== task.category
    );
  }

  function requestSave() {
    if (!draftTitle.trim()) {
      Alert.alert('Пустой текст', 'Название задачи не может быть пустым.');
      return;
    }
    if (!hasChanges()) {
      setModalVisible(false);
      return;
    }
    Alert.alert(
      'Сохранить изменения?',
      'Вы отредактировали задачу. Применить изменения?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сохранить',
          onPress: () => {
            onUpdate(task.id, {
              title:     draftTitle.trim(),
              dateLabel: draftDateLabel.trim() || task.dateLabel,
              time:      draftTime.trim() ? draftTime.trim() : null,
              priority:  draftPriority,
              category:  draftCategory.trim() || task.category,
            });
            setModalVisible(false);
          },
        },
      ],
    );
  }

  function requestClose() {
    if (hasChanges()) {
      Alert.alert(
        'Закрыть без сохранения?',
        'Есть несохранённые изменения. Вы уверены, что хотите выйти без сохранения?',
        [
          { text: 'Продолжить редактирование', style: 'cancel' },
          {
            text: 'Закрыть без сохранения',
            style: 'destructive',
            onPress: () => setModalVisible(false),
          },
        ],
      );
    } else {
      setModalVisible(false);
    }
  }

  return (
    <>
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [
          styles.card,
          task.done && styles.cardDone,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Priority bar */}
        <View style={[styles.priorityBar, { backgroundColor: PRIORITY_BAR_COLOR[task.priority] }]} />

        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, task.done && styles.checkboxDone]}
          onPress={() => onToggle(task.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
      </Pressable>

      {/* ── Edit modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={requestClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать задачу</Text>
              <TouchableOpacity onPress={requestClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <Text style={styles.fieldLabel}>Текст задачи</Text>
              <TextInput
                style={styles.fieldInput}
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="Что нужно сделать"
                placeholderTextColor={colors.muted}
                multiline
              />

              {/* Date label */}
              <Text style={styles.fieldLabel}>Дата</Text>
              <TextInput
                style={styles.fieldInput}
                value={draftDateLabel}
                onChangeText={setDraftDateLabel}
                placeholder="завтра, пятница, 25.12.2025..."
                placeholderTextColor={colors.muted}
              />

              {/* Time */}
              <Text style={styles.fieldLabel}>Время (необязательно)</Text>
              <TextInput
                style={styles.fieldInput}
                value={draftTime}
                onChangeText={setDraftTime}
                placeholder="15:00, вечером..."
                placeholderTextColor={colors.muted}
              />

              {/* Priority */}
              <Text style={styles.fieldLabel}>Приоритет</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_OPTIONS.map(opt => {
                  const active = draftPriority === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.priorityOption, active && styles.priorityOptionActive]}
                      onPress={() => setDraftPriority(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.priorityOptionText, active && styles.priorityOptionTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Category */}
              <Text style={styles.fieldLabel}>Категория</Text>
              <TextInput
                style={styles.fieldInput}
                value={draftCategory}
                onChangeText={setDraftCategory}
                placeholder="💼 Работа, 🛒 Покупки..."
                placeholderTextColor={colors.muted}
              />

              <View style={{ height: spacing.lg }} />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={requestClose}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={requestSave}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  cardPressed: {
    backgroundColor: colors.surface2,
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

  // ── Modal ──
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent:  'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius:  radius.md + 4,
    borderTopRightRadius: radius.md + 4,
    borderWidth:     1,
    borderColor:     colors.border2,
    borderBottomWidth: 0,
    maxHeight:       '85%',
    paddingTop:      spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    spacing.md,
  },
  modalTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      colors.text,
  },
  modalClose: {
    fontSize:   26,
    color:      colors.muted,
    lineHeight: 28,
  },

  modalBody: {
    maxHeight: 460,
  },

  fieldLabel: {
    fontSize:     12,
    fontWeight:   '600',
    color:        colors.muted,
    marginBottom: spacing.xs,
    marginTop:    spacing.md,
  },
  fieldInput: {
    backgroundColor: colors.surface2,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    radius.sm,
    color:           colors.text,
    fontSize:        14,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm + 2,
  },

  priorityRow: {
    flexDirection: 'row',
    gap:           spacing.sm,
  },
  priorityOption: {
    flex:              1,
    borderWidth:       1,
    borderColor:       colors.border,
    borderRadius:      radius.sm,
    paddingVertical:   spacing.sm,
    alignItems:        'center',
    backgroundColor:   colors.surface2,
  },
  priorityOptionActive: {
    borderColor:     colors.accent,
    backgroundColor: colors.accentGlow,
  },
  priorityOptionText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.muted,
  },
  priorityOptionTextActive: {
    color: colors.text,
  },

  modalActions: {
    flexDirection: 'row',
    gap:           spacing.sm,
    paddingVertical: spacing.lg,
  },
  modalCancelBtn: {
    flex:              1,
    borderWidth:       1,
    borderColor:       colors.border,
    borderRadius:      radius.sm,
    paddingVertical:   spacing.sm + 4,
    alignItems:        'center',
  },
  modalCancelText: {
    fontSize:   14,
    fontWeight: '600',
    color:      colors.muted,
  },
  modalSaveBtn: {
    flex:              1,
    backgroundColor:   colors.accent,
    borderRadius:      radius.sm,
    paddingVertical:   spacing.sm + 4,
    alignItems:        'center',
  },
  modalSaveText: {
    fontSize:   14,
    fontWeight: '600',
    color:      '#fff',
  },
});
