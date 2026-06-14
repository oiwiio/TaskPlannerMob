import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { cleanTitle } from '../utils/parser';
import { colors, radius, spacing } from '../constants/theme';

//Types

interface Props {
  pending:  string[];
  onConfirm: (index: number) => void;
  onReject:  (index: number) => void;
}

//Component

export default function ConfirmBanner({ pending, onConfirm, onReject }: Props) {
  if (pending.length === 0) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.heading}>❓ Обнаружены действия — добавить как задачи?</Text>

      {pending.map((sentence, i) => {
        const title = cleanTitle(sentence) || sentence;
        return (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText} numberOfLines={2}>
              «{title}»
            </Text>

            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.btnYes}
                onPress={() => onConfirm(i)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnYesText}>+ Добавить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnNo}
                onPress={() => onReject(i)}
                activeOpacity={0.7}
              >
                <Text style={styles.btnNoText}>Отменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

//Styles

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.accent,
    borderRadius:    radius.md,
    padding:         spacing.md,
    marginBottom:    spacing.md,
  },
  heading: {
    fontSize:     13,
    color:        colors.muted,
    fontWeight:   '500',
    marginBottom: spacing.sm,
  },

  item: {
    backgroundColor: colors.surface2,
    borderRadius:    radius.sm,
    padding:         spacing.sm + 2,
    marginTop:       spacing.xs,
    gap:             spacing.sm,
  },
  itemText: {
    fontSize:   14,
    color:      colors.text,
    lineHeight: 20,
    flex:       1,
  },
  itemActions: {
    flexDirection: 'row',
    gap:           spacing.sm,
  },

  btnYes: {
    backgroundColor: colors.greenBg,
    borderWidth:     1,
    borderColor:     colors.greenBorder,
    borderRadius:    6,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs + 1,
  },
  btnYesText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.green,
  },

  btnNo: {
    backgroundColor: 'transparent',
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    6,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs + 1,
  },
  btnNoText: {
    fontSize:   12,
    fontWeight: '600',
    color:      colors.muted,
  },
});
