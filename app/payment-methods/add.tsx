import { PrimaryButton, ThemedText, TopBar } from '@/components';
import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import PaymentMethodsService from '@/services/paymentMethods/PaymentMethods.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPaymentMethodScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('paymentMethodNameRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentMethodsService.create({ name: name.trim() });
      Alert.alert(t('success'), t('paymentMethodCreated'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating payment method:', error);
      Alert.alert(t('error'), t('failedToCreatePaymentMethod'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('newMethod')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >


          {/* Input Section */}
          <View style={styles.inputSection}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              {t('paymentMethodName')}
            </ThemedText>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder={t('enterPaymentMethodName')}
                placeholderTextColor={colors.textSecondary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <MaterialIcons
                name="account-balance-wallet"
                size={20}
                color={colors.textSecondary}
              />
            </View>

            <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
              {t('paymentMethodHint')}
            </ThemedText>
          </View>

          {/* Illustration */}
          <View style={[styles.illustrationContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.illustrationCircle}>
              <MaterialIcons
                name="account-balance"
                size={48}
                color={colors.primary}
                style={styles.illustrationIcon}
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
          <PrimaryButton
            title={isSubmitting ? t('saving') : t('saveMethod')}
            onPress={handleSave}
            disabled={isSubmitting || !name.trim()}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 4,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.5,
    marginBottom: Spacing.xl,
  },
  inputSection: {
    marginBottom: Spacing.xl * 2,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.fontSize.xs * 1.6,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 3,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationIcon: {
    opacity: 0.8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.xl,
  },
});
