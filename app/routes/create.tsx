import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { useColorScheme, useThemeColor } from '@/hooks/useColorScheme';
import i18n from '@/i18n';
import RoutesService from '@/services/routes/Routes.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
import { z } from 'zod';

// Zod validation schema
const routeSchema = z.object({
  name: z.string().min(1, i18n.t('routeNameIsRequired')).max(50, i18n.t('nameTooLong')),
});


export default function CreateRoute() {
  const colors = useThemeColor();
  const scheme = useColorScheme();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState('');

  // Set default route name on component mount
  useEffect(() => {
    const defaultName = `${t('route')} ${moment().format('MM/DD')}`;
    setName(defaultName);
  }, [t]);

  const validateForm = (): boolean => {
    try {
      routeSchema.parse({
        name: name.trim(),
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.show({ message: t('pleaseCheckTheFormAndTryAgain'), type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const routeData = {
        name: name.trim(),
      };

      const route = await RoutesService.create(routeData);

      router.replace(Routes.routeView(route.id));
    } catch (error) {
      toast.show({ message: t('failedToCreateRoute'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestedName = () => {
    const suggestions = [
      `${t('route')} ${moment().format('MM/DD')}`,
      `${t('route')} ${moment().format('dddd')} `,
      `${t('route')} ${moment().format('MMM DD')}`,
      `${t('delivery')} ${moment().format('MM/DD')}`,
    ];
    
    const currentIndex = suggestions.findIndex(s => s === name);
    const nextIndex = (currentIndex + 1) % suggestions.length;
    setName(suggestions[nextIndex]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>{t('createRoute')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.backgroundSecondary }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Route Name Section */}
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('routeDetails')}</ThemedText>
            
            <View style={styles.nameFieldContainer}>
              <FormField
                label={t('routeName')}
                value={name}
                onChangeText={setName}
                placeholder={t('enterRouteName')}
                error={errors.name}
                autoCapitalize="words"
                required
              />
              
              <TouchableOpacity
                style={styles.suggestButton}
                onPress={generateSuggestedName}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="refresh" 
                  size={16} 
                  color={colors.primary} 
                />
                <ThemedText style={[styles.suggestText, { color: colors.primary }]}>
                  {t('suggest')}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.info }]}>
              <MaterialIcons
                name="info"
                size={16}
                color={colors.info}
                style={styles.infoIcon}
              />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {t('routeCreationTip')}
              </ThemedText>
            </View>
          </View>

          {/* Route Preview */}
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{t('routePreview')}</ThemedText>

            <View style={[styles.previewCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <View style={styles.previewHeader}>
                <ThemedText style={[styles.previewRouteName, { color: colors.primary }]}>
                  #{name}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: colors.textTertiary + '20' }]}>
                  <ThemedText style={[styles.statusText, { color: colors.textTertiary }]}>{t('created')}</ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.previewDate, { color: colors.textSecondary }]}>
                {moment().format('dddd • MMM DD, YYYY')}
              </ThemedText>

              <View style={styles.previewStats}>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.text }]}>0</ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('stops')}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.text }]}>-</ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{t('eta')}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <PrimaryButton
            title={isLoading ? t('creatingRoute') : t('createRoute')}
            onPress={handleSubmit}
            disabled={isLoading || !name.trim()}
            size="large"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
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
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  nameFieldContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'absolute',
    right: 0,
    top: -6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  suggestText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  infoIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  previewCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewRouteName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  previewStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});