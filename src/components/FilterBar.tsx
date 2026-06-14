import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FilterType, SortType } from '../hooks/useTasks';
import { colors, radius, spacing } from '../constants/theme';

//Types

interface Props {
  filter:      FilterType;
  sortBy:      SortType;
  onFilter:    (f: FilterType) => void;
  onSort:      (s: SortType) => void;
  totalCount:  number;
  activeCount: number;
  doneCount:   number;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',    label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'done',   label: 'Выполненные' },
];

const SORTS: { key: SortType; label: string }[] = [
  { key: 'created',  label: 'По добавлению' },
  { key: 'date',     label: 'По дате' },
  { key: 'priority', label: 'По приоритету' },
];

//Component

export default function FilterBar({
  filter, sortBy, onFilter, onSort,
  totalCount, activeCount, doneCount,
}: Props) {

  function countFor(key: FilterType): number {
    if (key === 'all')    return totalCount;
    if (key === 'active') return activeCount;
    return doneCount;
  }

  return (
    <View style={styles.wrapper}>
      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          const count  = countFor(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {f.label}
                {count > 0 ? `  ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        <Text style={styles.sortLabel}>Сортировка:</Text>
        {SORTS.map(s => {
          const active = sortBy === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortBtn, active && styles.sortBtnActive]}
              onPress={() => onSort(s.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortBtnText, active && styles.sortBtnTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  filtersRow: {
    flexDirection: 'row',
    gap:           spacing.xs,
    paddingRight:  spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs - 1,
    borderRadius:      radius.full,
    borderWidth:       1,
    borderColor:       colors.border,
    backgroundColor:   colors.surface,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor:     colors.accent,
  },
  pillText: {
    fontSize:   12,
    fontWeight: '500',
    color:      colors.muted,
  },
  pillTextActive: {
    color: '#fff',
  },

  sortRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
    paddingRight:  spacing.md,
  },
  sortLabel: {
    fontSize: 11,
    color:    colors.muted,
    marginRight: 2,
  },
  sortBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical:   3,
    borderRadius:      radius.sm,
    borderWidth:       1,
    borderColor:       colors.border,
    backgroundColor:   'transparent',
  },
  sortBtnActive: {
    borderColor:     colors.accent,
    backgroundColor: colors.surface,
  },
  sortBtnText: {
    fontSize:   11,
    fontWeight: '500',
    color:      colors.muted,
  },
  sortBtnTextActive: {
    color: colors.accent,
  },
});
