import { ThemedText, TopBar } from '@/components';
import { CompanyList } from '@/components/companies/CompanyList';
import { Routes, Spacing, Typography } from '@/constants';
import { useCompanies } from '@/context/CompaniesContext';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** In-app company picker (opened from the drawer when the user has several). */
export default function CompanySwitchPage() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const toast = useToast();
  const { companies, activeCompany, selectCompany } = useCompanies();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(Routes.home);
  };

  const handleSelect = async (companyId: string) => {
    // Picking the company already in use is just a close
    if (companyId === activeCompany?.id) {
      goBack();
      return;
    }
    try {
      // The drawer/tabs subtree is keyed by the active company id, so selecting
      // remounts it and every screen reloads its data for the new company.
      await selectCompany(companyId);
      goBack();
    } catch {
      toast.show({ message: t('failedToSelectCompany'), type: 'error' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('switchCompany')} showBack backTo={Routes.home} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('switchCompanySubtitle')}
          </ThemedText>
        </View>
        <CompanyList
          companies={companies}
          activeCompanyId={activeCompany?.id}
          onSelect={handleSelect}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing.xl },
  header: { padding: Spacing.xl, paddingBottom: Spacing.lg },
  subtitle: { fontSize: Typography.fontSize.base, lineHeight: 22 },
});
