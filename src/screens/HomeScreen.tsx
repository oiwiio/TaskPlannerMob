import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';

import { useTasks } from '../hooks/useTasks';
import TaskCard      from '../components/TaskCard';
import ConfirmBanner from '../components/ConfirmBanner';
import FilterBar     from '../components/FilterBar';
import EmptyState    from '../components/EmptyState';
import { colors, radius, spacing } from '../constants/theme';

const EXAMPLE =
  'Завтра в 15:00 позвонить клиенту. Срочно нужно доделать отчёт до пятницы! ' +
  'Вечером купить молоко и хлеб. Я хочу сварить пельмени. ' +
  'Записаться к врачу до понедельника — важно. Было бы неплохо прибраться в выходные.';

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const {
    loading,
    pending,
    filter, sortBy,
    totalCount, activeCount, doneCount,
    visibleActive, visibleDone,
    parse,
    confirmPending, rejectPending,
    toggleDone, deleteTask, updateTask, clearAll,
    setFilter, setSortBy,
  } = useTasks();
  
  //Actions

  function handleParse() {
    const text = inputText.trim();
    if (!text) return;
    parse(text);
    setInputText('');
    // scroll down so user sees result
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }

  function handleClearAll() {
    if (totalCount === 0 && pending.length === 0) return;
    Alert.alert(
      'Очистить всё',
      'Удалить все задачи?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: clearAll },
      ],
    );
  }

  function handleLoadExample() {
    setInputText(EXAMPLE);
  }

  //Derived

  const showDoneSection = visibleDone.length > 0 && filter !== 'active';
  const showEmpty       = visibleActive.length === 0 && !showDoneSection && !loading;
  const countLabel      = (() => {
    const n = filter === 'all' ? totalCount : filter === 'active' ? activeCount : doneCount;
    if (n === 0) return '';
    const word = n % 10 === 1 && n % 100 !== 11 ? 'задача'
               : [2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100) ? 'задачи'
               : 'задач';
    return `${n} ${word}`;
  })();

  //Render

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/*Header*/}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>Планировщик</Text>
            </View>
            <Text style={styles.h1}>
              Пишите задачи{' '}
              <Text style={styles.h1Accent}>текстом</Text>
            </Text>
            <Text style={styles.subtitle}>
              Просто введите мысли — алгоритм разберёт их на задачи с датами и приоритетами
            </Text>
          </View>

          {/* Input section*/}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.textarea}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Завтра в 15:00 позвонить клиенту, вечером купить молоко, а ещё нужно срочно доделать отчёт до пятницы..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              returnKeyType="default"
              blurOnSubmit={false}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleParse}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>✦ Разобрать текст</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnGhost}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Text style={styles.btnGhostText}>Очистить всё</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnGhost, styles.btnSm]}
                onPress={handleLoadExample}
                activeOpacity={0.7}
              >
                <Text style={styles.btnGhostText}>Пример</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*Confirm banner*/}
          <ConfirmBanner
            pending={pending}
            onConfirm={confirmPending}
            onReject={rejectPending}
          />

          {/*Filters*/}
          <FilterBar
            filter={filter}
            sortBy={sortBy}
            onFilter={setFilter}
            onSort={setSortBy}
            totalCount={totalCount}
            activeCount={activeCount}
            doneCount={doneCount}
          />

          {/*Count label */}
          {countLabel ? (
            <Text style={styles.tasksCount}>{countLabel}</Text>
          ) : null}

          {/* ── Active tasks ── */}
          {visibleActive.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleDone}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          ))}

          {/*Empty state*/}
          {showEmpty && <EmptyState />}

          {/* ── Done section ── */}
          {showDoneSection && (
            <>
              <View style={styles.doneDivider}>
                <Text style={styles.doneDividerText}>ВЫПОЛНЕННЫЕ</Text>
                <View style={styles.doneDividerLine} />
              </View>

              {visibleDone.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleDone}
                  onDelete={deleteTask}
                  onUpdate={updateTask}
                />
              ))}
            </>
          )}

          {/* bottom padding */}
          <View style={{ height: spacing.xxl * 2 }} />

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

//Styles

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.xl + spacing.lg,
  },

  // Header
  header: {
    marginBottom: spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs + 2,
    marginBottom:  spacing.xs,
  },
  logoDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  logoText: {
    fontSize:   14,
    fontWeight: '700',
    color:      colors.accent,
    letterSpacing: -0.3,
  },
  h1: {
    fontSize:      28,
    fontWeight:    '700',
    color:         colors.text,
    lineHeight:    34,
    letterSpacing: -0.8,
    marginBottom:  spacing.xs,
  },
  h1Accent: {
    color: colors.accent,
  },
  subtitle: {
    fontSize:   13,
    color:      colors.muted,
    lineHeight: 19,
  },

  // Input section
  inputSection: {
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.border2,
    borderRadius:    radius.md,
    padding:         spacing.md,
    marginBottom:    spacing.lg,
  },
  textarea: {
    backgroundColor: colors.surface2,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    radius.sm,
    color:           colors.text,
    fontSize:        14,
    lineHeight:      22,
    padding:         spacing.md,
    minHeight:       110,
    marginBottom:    spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius:    radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm + 2,
  },
  btnPrimaryText: {
    color:      '#fff',
    fontSize:   13,
    fontWeight: '600',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm + 2,
  },
  btnSm: {
    paddingHorizontal: spacing.sm + 2,
  },
  btnGhostText: {
    color:      colors.muted,
    fontSize:   13,
    fontWeight: '600',
  },

  // Count
  tasksCount: {
    fontSize:     12,
    color:        colors.muted,
    marginBottom: spacing.sm,
  },

  // Done section divider
  doneDivider: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
    marginTop:     spacing.xl,
    marginBottom:  spacing.md,
  },
  doneDividerText: {
    fontSize:      11,
    fontWeight:    '600',
    color:         colors.muted,
    letterSpacing: 0.8,
  },
  doneDividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: colors.border,
  },
});
