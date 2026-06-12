import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { useToast } from '@/context/ToastContext';
import CompaniesService from '@/services/companies/Companies.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField, PrimaryButton, ThemedText } from '../../components';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants';

export default function AddCompanyPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectCompany } = useCompanies();
  const {refreshUser } = useAuth()
  const toast = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.show({ message: t('companyNameIsRequired'), type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const company = await CompaniesService.create(name);
      selectCompany(company.id);
      refreshUser();
      router.replace('/companies/select');

    } catch (error) {
      toast.show({ message: t('failedToCreateCompany'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('addNewCompany')}</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.form}>
            <ThemedText style={styles.sectionTitle}>{t('companyInformation')}</ThemedText>
            
            <FormField
              label={t('companyName')}
              value={name}
              onChangeText={setName}
              placeholder={t('enterCompanyName')}
              required
              autoCapitalize="words"
            />

            <FormField
              label={t('taxIdOptional')}
              value={taxId}
              onChangeText={setTaxId}
              placeholder={t('enterTaxId')}
              autoCapitalize="characters"
            />

            <View style={styles.infoBox}>
              <MaterialIcons 
                name="info" 
                size={16} 
                color={Colors.light.info} 
                style={styles.infoIcon}
              />
              <ThemedText style={styles.infoText}>
                {t('companyInfoLater')}
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? t('creatingCompany') : t('createCompany')}
            onPress={handleSubmit}
            disabled={isLoading || !name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  placeholder: {
    width: 32, // Same as back button width for centering
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.info,
  },
  infoIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
