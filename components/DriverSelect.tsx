import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type DriverSelectProps = {
  members: CompanyMember[];
  /** Selected member's userId, or null for "unassigned". */
  value: string | null;
  onSelect: (userId: string | null) => void;
  /** Shows an "Unassigned" option (assigning `null` is valid on existing routes). */
  allowUnassigned?: boolean;
  disabled?: boolean;
  label?: string;
};

export const memberFullName = (m: Pick<CompanyMember, 'name' | 'surnames' | 'email'>) =>
  `${m.name} ${m.surnames}`.trim() || m.email;

export default function DriverSelect({
  members,
  value,
  onSelect,
  allowUnassigned = false,
  disabled = false,
  label,
}: DriverSelectProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [visible, setVisible] = useState(false);

  const selected = members.find((m) => m.userId === value);

  const handleSelect = (userId: string | null) => {
    setVisible(false);
    if (userId !== value) onSelect(userId);
  };

  const options: (CompanyMember | null)[] = allowUnassigned ? [null, ...members] : members;

  const renderItem = ({ item }: { item: CompanyMember | null }) => {
    const userId = item?.userId ?? null;
    const isSelected = userId === value;
    return (
      <TouchableOpacity
        style={[styles.item, { borderBottomColor: colors.border }]}
        onPress={() => handleSelect(userId)}
        activeOpacity={0.7}
      >
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {item ? memberFullName(item) : t('unassigned')}
          </Text>
          {item && (
            <Text style={[styles.itemRole, { color: colors.textSecondary }]}>
              {t(`companyRole_${item.role}`)}
            </Text>
          )}
        </View>
        {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.background, borderColor: selected ? colors.primary : colors.border },
          disabled && styles.disabled,
        ]}
        onPress={() => setVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.buttonText, { color: selected ? colors.text : colors.textSecondary }]}
          numberOfLines={1}
        >
          {selected ? memberFullName(selected) : t('selectDriver')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('driver')}</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.close} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item?.userId ?? 'unassigned'}
            renderItem={renderItem}
            style={styles.list}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  disabled: { opacity: 0.6 },
  buttonText: {
    flex: 1,
    marginRight: Spacing.sm,
    fontSize: Typography.fontSize.base,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  close: { padding: Spacing.xs },
  list: { flex: 1, paddingHorizontal: Spacing.lg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  itemRole: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
});
