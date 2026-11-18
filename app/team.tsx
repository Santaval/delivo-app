import { FormField, PrimaryButton, ThemedText, TopBar } from '@/components';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import CompaniesService from '@/services/companies/Companies.service';
import { confirmDestructive } from '@/utils/confirm';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITABLE_ROLES: InvitableRole[] = ['DEALER', 'ADMIN'];

export default function TeamScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const { user } = useAuth();
  const { activeCompany } = useCompanies();
  const companyId = activeCompany?.id;

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitableRole>('DEALER');
  const [isSending, setIsSending] = useState(false);

  const myRole = members.find((m) => m.userId === user?.id)?.role;
  // Only OWNER/ADMIN can invite; the API enforces it too (403)
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  const roleLabel = useCallback((r: CompanyRole) => t(`companyRole_${r}`), [t]);

  const load = useCallback(async () => {
    if (!companyId) return;
    try {
      const memberList = await CompaniesService.listMembers(companyId);
      setMembers(memberList);
      const me = memberList.find((m) => m.userId === user?.id);
      if (me && (me.role === 'OWNER' || me.role === 'ADMIN')) {
        setInvitations(await CompaniesService.listInvitations(companyId));
      } else {
        setInvitations([]);
      }
    } catch {
      toast.show({ message: t('failedToLoadTeam'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, user?.id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const trimmedEmail = email.trim();
  const emailError =
    trimmedEmail.length > 0 && !EMAIL_REGEX.test(trimmedEmail)
      ? t('invalidEmail')
      : undefined;

  const handleInvite = async () => {
    if (!companyId || !EMAIL_REGEX.test(trimmedEmail)) {
      toast.show({ message: t('invalidEmail'), type: 'error' });
      return;
    }
    setIsSending(true);
    try {
      const invitation = await CompaniesService.inviteMember(companyId, trimmedEmail, role);
      setInvitations((prev) => [invitation, ...prev]);
      setEmail('');
      toast.show({ message: t('invitationSent'), type: 'success' });
    } catch (error: any) {
      const status = error?.response?.status;
      // 402 (plan limit) is surfaced globally by the API interceptor
      if (status === 402) return;
      toast.show({
        message:
          status === 409
            ? t('invitationConflict')
            : status === 403
              ? t('notAllowedToInvite')
              : t('failedToSendInvitation'),
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRevoke = (invitation: CompanyInvitation) => {
    if (!companyId) return;
    confirmDestructive({
      title: t('revokeInvitation'),
      message: t('revokeInvitationConfirm', { email: invitation.email }),
      confirmLabel: t('revoke'),
      onConfirm: async () => {
        try {
          await CompaniesService.revokeInvitation(companyId, invitation.id);
          setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
          toast.show({ message: t('invitationRevoked'), type: 'success' });
        } catch {
          toast.show({ message: t('failedToRevokeInvitation'), type: 'error' });
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
          ) : (
            <>
              {canManage && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <ThemedText variant="subtitle">{t('inviteMember')}</ThemedText>
                  <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                    {t('inviteMemberSubtitle')}
                  </ThemedText>

                  <FormField
                    label={t('email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('invitationEmailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={emailError}
                    required
                  />

                  <View>
                    <ThemedText style={styles.roleLabel}>{t('role')}</ThemedText>
                    <View style={styles.roleRow}>
                      {INVITABLE_ROLES.map((r) => {
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
                    title={isSending ? t('sendingInvitation') : t('sendInvitation')}
                    onPress={handleInvite}
                    disabled={isSending || !EMAIL_REGEX.test(trimmedEmail)}
                    fullWidth
                  />
                </View>
              )}

              {canManage && invitations.length > 0 && (
                <View style={styles.section}>
                  <ThemedText variant="subtitle">{t('pendingInvitations')}</ThemedText>
                  {invitations.map((invitation) => (
                    <View
                      key={invitation.id}
                      style={[
                        styles.row,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <MaterialIcons name="mail-outline" size={24} color={colors.textSecondary} />
                      <View style={styles.rowText}>
                        <ThemedText numberOfLines={1}>{invitation.email}</ThemedText>
                        <ThemedText variant="caption" style={{ color: colors.textSecondary }}>
                          {roleLabel(invitation.role)}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={t('revokeInvitation')}
                        hitSlop={8}
                        onPress={() => handleRevoke(invitation)}
                      >
                        <MaterialIcons name="close" size={24} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <ThemedText variant="subtitle">{t('members')}</ThemedText>
                {members.map((member) => (
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
                        {`${member.name} ${member.surnames}`.trim() || member.email}
                      </ThemedText>
                      <ThemedText
                        variant="caption"
                        numberOfLines={1}
                        style={{ color: colors.textSecondary }}
                      >
                        {member.email}
                      </ThemedText>
                    </View>
                    <ThemedText variant="caption" style={{ color: colors.primary }}>
                      {roleLabel(member.role)}
                    </ThemedText>
                  </View>
                ))}
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
  roleLabel: {
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
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
