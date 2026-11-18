import { PrimaryButton, ThemedText, TopBar } from '@/components';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useFocusRefetch from '@/hooks/useFocusRefetch';
import CompaniesService from '@/services/companies/Companies.service';
import { confirmDestructive } from '@/utils/confirm';
import {
  MEMBER_CODE_LENGTH,
  formatMemberCode,
  normalizeMemberCode,
} from '@/utils/memberCode';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ASSIGNABLE_ROLES: AssignableRole[] = ['DEALER', 'ADMIN'];

const fullName = (m: CompanyMember) =>
  `${m.name} ${m.surnames}`.trim() || m.email;

export default function TeamScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const { user } = useAuth();
  const { activeCompany } = useCompanies();
  const companyId = activeCompany?.id;

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  // Digits only; the input displays them grouped ("482 913")
  const [code, setCode] = useState('');
  const [role, setRole] = useState<AssignableRole>('DEALER');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const myRole = members.find((m) => m.userId === user?.id)?.role;
  // Only OWNER/ADMIN can add/remove members; the API enforces it too (403)
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';
  const canRemove = (member: CompanyMember) =>
    canManage &&
    member.userId !== user?.id &&
    // An ADMIN can't remove an OWNER (the API would answer 403)
    !(myRole === 'ADMIN' && member.role === 'OWNER');

  const roleLabel = (r: CompanyRole) => t(`companyRole_${r}`);

  const load = async (isFirstFocus: boolean) => {
    if (!companyId) return;
    // Only the first focus shows the loader; returning to the screen reloads silently
    if (isFirstFocus) {
      setIsLoading(true);
      setLoadFailed(false);
    }
    try {
      setMembers(await CompaniesService.listMembers(companyId));
      setLoadFailed(false);
    } catch {
      if (isFirstFocus) setLoadFailed(true);
      else toast.show({ message: t('failedToLoadTeam'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Keyed by company so switching company shows the loader again
  useFocusRefetch(load, companyId);

  const isCodeComplete = code.length === MEMBER_CODE_LENGTH;

  const handleAdd = async () => {
    if (!companyId || !isCodeComplete || isAdding) return;
    setIsAdding(true);
    try {
      const added = await CompaniesService.addMemberByCode(companyId, code, role);
      setMembers((prev) => [...prev.filter((m) => m.userId !== added.userId), added]);
      setCode('');
      toast.show({
        message: t('memberAdded', { name: fullName(added), role: roleLabel(added.role) }),
        type: 'success',
      });
    } catch (error: any) {
      const status = error?.response?.status;
      // 402 (plan limit) is surfaced globally by the API interceptor
      if (status === 402) return;
      toast.show({
        message:
          status === 404
            ? t('memberCodeNotFound')
            : status === 409
              ? t('memberAlreadyInCompany')
              : status === 429
                ? t('addMemberRateLimited')
                : status === 403
                  ? t('notAllowedToAddMembers')
                  : t('failedToAddMember'),
        type: 'error',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (member: CompanyMember) => {
    if (!companyId) return;
    const name = fullName(member);
    confirmDestructive({
      title: t('removeMember'),
      message: t('removeMemberConfirm', { name }),
      confirmLabel: t('removeMemberCta'),
      onConfirm: async () => {
        setRemovingId(member.userId);
        try {
          await CompaniesService.removeMember(companyId, member.userId);
          setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
          toast.show({ message: t('memberRemoved', { name }), type: 'success' });
        } catch (error: any) {
          const status = error?.response?.status;
          toast.show({
            message:
              status === 409
                ? t('cannotRemoveLastOwner')
                : status === 403
                  ? t('notAllowedToRemoveMembers')
                  : t('failedToRemoveMember'),
            type: 'error',
          });
        } finally {
          setRemovingId(null);
        }
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('team')} showBack backTo={Routes.home} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : loadFailed ? (
            <View style={styles.errorBox}>
              <ThemedText style={{ color: colors.textSecondary }}>
                {t('failedToLoadTeam')}
              </ThemedText>
              <PrimaryButton title={t('retry')} onPress={() => load(true)} />
            </View>
          ) : (
            <>
              {canManage && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <ThemedText variant="subtitle">{t('addMember')}</ThemedText>
                  <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                    {t('addMemberSubtitle')}
                  </ThemedText>

                  <View>
                    <ThemedText style={styles.fieldLabel}>{t('memberCodeLabel')}</ThemedText>
                    <TextInput
                      style={[
                        styles.codeInput,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                        },
                      ]}
                      value={formatMemberCode(code)}
                      onChangeText={(text) => setCode(normalizeMemberCode(text))}
                      placeholder={t('memberCodePlaceholder')}
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      // 6 digits + the display space
                      maxLength={MEMBER_CODE_LENGTH + 1}
                      autoCorrect={false}
                      autoComplete="off"
                      accessibilityLabel={t('memberCodeLabel')}
                    />
                  </View>

                  <View>
                    <ThemedText style={styles.fieldLabel}>{t('role')}</ThemedText>
                    <View style={styles.roleRow}>
                      {ASSIGNABLE_ROLES.map((r) => {
                        const selected = role === r;
                        return (
                          <TouchableOpacity
                            key={r}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            style={[
                              styles.roleChip,
                              {
                                borderColor: selected ? colors.primary : colors.border,
                                backgroundColor: selected
                                  ? colors.primary + '1A'
                                  : 'transparent',
                              },
                            ]}
                            onPress={() => setRole(r)}
                          >
                            <ThemedText
                              style={{
                                color: selected ? colors.primary : colors.text,
                                fontWeight: Typography.fontWeight.medium,
                              }}
                            >
                              {roleLabel(r)}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                      {t(`companyRoleHelp_${role}`)}
                    </ThemedText>
                  </View>

                  <PrimaryButton
                    title={isAdding ? t('addingMember') : t('addMemberCta')}
                    onPress={handleAdd}
                    disabled={isAdding || !isCodeComplete}
                    fullWidth
                  />
                </View>
              )}

              <View style={styles.section}>
                <ThemedText variant="subtitle">{t('members')}</ThemedText>
                {members.map((member) => {
                  const isMe = member.userId === user?.id;
                  return (
                    <View
                      key={member.userId}
                      style={[
                        styles.row,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <MaterialIcons name="person" size={24} color={colors.textSecondary} />
                      <View style={styles.rowText}>
                        <ThemedText numberOfLines={1}>
                          {fullName(member)}
                          {isMe ? ` (${t('you')})` : ''}
                        </ThemedText>
                        <ThemedText
                          variant="caption"
                          numberOfLines={1}
                          style={{ color: colors.textSecondary }}
                        >
                          {member.email}
                        </ThemedText>
                      </View>
                      <View style={[styles.badge, { backgroundColor: colors.primary + '1A' }]}>
                        <ThemedText variant="caption" style={{ color: colors.primary }}>
                          {roleLabel(member.role)}
                        </ThemedText>
                      </View>
                      {canRemove(member) &&
                        (removingId === member.userId ? (
                          <ActivityIndicator size="small" color={colors.danger} />
                        ) : (
                          <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={t('removeMember')}
                            hitSlop={8}
                            disabled={removingId !== null}
                            onPress={() => handleRemove(member)}
                          >
                            <MaterialIcons name="person-remove" size={24} color={colors.danger} />
                          </TouchableOpacity>
                        ))}
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  loader: { marginTop: Spacing['3xl'] },
  errorBox: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing['3xl'] },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  section: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  rowText: { flex: 1 },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  fieldLabel: {
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: Typography.fontSize.xl,
    letterSpacing: 4,
    textAlign: 'center',
  },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  roleChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
});
