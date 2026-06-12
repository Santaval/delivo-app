import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, ThemedText, ThemedView } from '../../components';
import { toast } from '../../context/ToastContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants';
import { useCompanies } from '../../context/CompaniesContext';

export default function CompanySelectPage() {
  const { t } = useTranslation();
  const { companies, selectCompany, activeCompany } = useCompanies();

  const handleSelectCompany = async (companyId: string) => {
    try {
      await selectCompany(companyId);
      router.replace('/');
    } catch (error) {
      toast.error(t('failedToSelectCompany'));
    }
  };

  const handleAddNewCompany = () => {
    router.push('/companies/add');
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getCompanyId = (company: Company) => {
    // Generate a formatted company ID for display
    const idNumber = company.id.slice(-4);
    return `ID: 3-101-${idNumber}`;
  };

  if (!companies || companies.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>{t('loadingCompanies')}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('selectCompany')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('chooseCompanyToWorkWith')}</ThemedText>
        </View>

        <View style={styles.companiesList}>
          {companies.map((company) => {
            const isSelected = activeCompany?.id === company.id;
            return (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.companyCard,
                  isSelected && styles.selectedCompanyCard
                ]}
                onPress={() => handleSelectCompany(company.id)}
                activeOpacity={0.8}
              >
                <View style={styles.companyContent}>
                  <View style={[
                    styles.companyAvatar,
                    { backgroundColor: isSelected ? Colors.light.primary : Colors.light.backgroundTertiary }
                  ]}>
                    <ThemedText style={[
                      styles.companyAvatarText,
                      { color: isSelected ? Colors.light.textInverse : Colors.light.text }
                    ]}>
                      {getCompanyInitials(company.name)}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.companyInfo}>
                    <ThemedText style={styles.companyName}>
                      {company.name}
                    </ThemedText>
                    <ThemedText style={styles.companyId}>
                      {getCompanyId(company)}
                    </ThemedText>
                  </View>

                  <View style={styles.selectionIndicator}>
                    {isSelected ? (
                      <View style={styles.selectedDot} />
                    ) : (
                      <MaterialIcons 
                        name="check" 
                        size={20} 
                        color={Colors.light.textTertiary} 
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.addButtonContainer}>
          <PrimaryButton
            title={t('addNewCompany')}
            onPress={handleAddNewCompany}
            style={styles.addButton}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  companiesList: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  companyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    ...Shadows.small,
  },
  selectedCompanyCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
  },
  companyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  companyAvatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
    color: Colors.light.text,
  },
  companyId: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
  },
  addButtonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  addButton: {
    width: '100%',
  },
});