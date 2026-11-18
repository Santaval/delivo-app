import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useCredits } from '@/context/CreditsContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PrimaryButton } from '../PrimaryButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

/**
 * Shown when the API answers 402 INSUFFICIENT_CREDITS. It is an overlay, so the screen
 * underneath (e.g. the order form) is neither navigated away from nor remounted.
 */
export function OutOfCreditsSheet() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { outOfCredits, dismissOutOfCredits, canPurchase, isRoleLoading } = useCredits();

  // Unknown role (loading or failed) is treated as DEALER: no buy button.
  const showBuy = canPurchase && !isRoleLoading;

  const handleBuy = () => {
    dismissOutOfCredits();
    router.push(Routes.creditsBuy);
  };

  return (
    <Modal
      visible={outOfCredits !== null}
      transparent
      animationType="fade"
      onRequestClose={dismissOutOfCredits}
    >
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={dismissOutOfCredits}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.icon}>
              <MaterialIcons name="receipt-long" size={48} color={colors.danger} />
            </View>

            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t('outOfCreditsTitle')}
            </ThemedText>

            <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
              {showBuy ? t('outOfCreditsMessage') : t('outOfCreditsDealerMessage')}
            </ThemedText>

            <View style={styles.actions}>
              {showBuy ? (
                <>
                  <PrimaryButton title={t('creditsBuy')} onPress={handleBuy} />
                  <PrimaryButton
                    title={t('notNow')}
                    onPress={dismissOutOfCredits}
                    variant="outline"
                  />
                </>
              ) : (
                <PrimaryButton title={t('ok')} onPress={dismissOutOfCredits} />
              )}
            </View>
          </ThemedView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  icon: { marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actions: { width: '100%', gap: Spacing.md },
});
