import { PrimaryButton, ThemedText } from '@/components';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import AuthService from '@/services/auth/Auth.service';
import CompaniesService from '@/services/companies/Companies.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AcceptInvitationScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const { refreshUser } = useAuth();
  const { activeCompany, selectCompany, companies } = useCompanies();
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const leave = () => {
    // Deep-linked entry has no history to go back to
    if (router.canGoBack()) router.back();
    else router.replace(Routes.root);
  };

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorKey(null);
    try {
      await CompaniesService.acceptInvitation(token);

      // The API doesn't say which company was joined: diff against what we had
      const knownIds = new Set(companies.map((c) => c.id));
      const updated = await AuthService.getUser();
      const joined = updated.companies.find((c) => !knownIds.has(c.id));

      // Persist the selection first (same order as companies/add) so the
      // refreshed list resolves it into the active company. Only when there is
      // no active company yet — never yank someone out of the one they're using.
      if (joined && !activeCompany) await selectCompany(joined.id);
      await refreshUser();

      toast.show({
        message: t('invitationAccepted', { company: joined?.name ?? '' }),
        type: 'success',
      });
      // With no active company the guard in app/_layout.tsx swaps this screen
      // for the app stack on its own; otherwise go back where we came from.
      if (activeCompany) leave();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 402) return; // surfaced by the plan-limit interceptor
      setErrorKey(
        status === 404
          ? 'invitationInvalid'
          : status === 410
            ? 'invitationExpired'
            : status === 403
              ? 'invitationWrongAccount'
              : status === 409
                ? 'invitationAlreadyMember'
                : 'failedToAcceptInvitation',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const failed = !token || errorKey !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <MaterialIcons
            name={failed ? 'error-outline' : 'mail-outline'}
            size={32}
            color={failed ? colors.danger : colors.primary}
          />
        </View>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          {t('acceptInvitationTitle')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: failed ? colors.danger : colors.textSecondary }]}>
          {failed ? t(errorKey ?? 'invitationInvalid') : t('acceptInvitationSubtitle')}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        {!failed && (
          <PrimaryButton
            title={isLoading ? t('acceptingInvitation') : t('acceptInvitation')}
            onPress={handleAccept}
            disabled={isLoading}
            fullWidth
          />
        )}
        <PrimaryButton
          title={failed ? t('continue') : t('cancel')}
          variant="outline"
          onPress={leave}
          disabled={isLoading}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  actions: { padding: Spacing.xl, gap: Spacing.md },
});
