import { ThemedText, TopBar } from '@/components';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useCompanies } from '@/context/CompaniesContext';
import { useCredits } from '@/context/CreditsContext';
import { usePurchases } from '@/context/PurchasesContext';
import { toast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import CreditsService from '@/services/billing/Credits.service';
import { pollForCreditIncrease } from '@/services/billing/pollCredits';
import { CreditPackOption, formatPrice, matchCreditPackages } from '@/utils/creditPacks';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Phase = 'idle' | 'purchasing' | 'processing';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace(Routes.root);
}

export default function BuyCredits() {
  const colors = useThemeColor();
  const { t, i18n } = useTranslation();
  const { activeCompany } = useCompanies();
  const { balance, packs, canPurchase, isRoleLoading, refresh } = useCredits();
  const { creditsOffering, isIdentityReady, purchaseCredits } = usePurchases();

  const [phase, setPhase] = useState<Phase>('idle');
  const cancelledRef = useRef(false);
  const startCompanyRef = useRef<{ id: string; name: string } | null>(null);
  const activeCompanyId = activeCompany?.id;

  // Defence in depth: the entry points are already gated by canPurchase.
  useEffect(() => {
    if (isRoleLoading || canPurchase) return;
    toast.info(t('creditsBuyOwnerOnly'));
    goBack();
  }, [isRoleLoading, canPurchase, t]);

  // Switching company mid-purchase: stop tracking it so it can never be shown as credited
  // to the new company.
  useEffect(() => {
    const start = startCompanyRef.current;
    if (phase === 'idle' || !start || start.id === activeCompanyId) return;
    cancelledRef.current = true;
    toast.info(t('creditsPurchaseForCompany', { company: start.name }));
    goBack();
  }, [activeCompanyId, phase, t]);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const options = useMemo(
    () => matchCreditPackages(creditsOffering?.availablePackages ?? [], packs),
    [creditsOffering, packs],
  );
  const bestValueCredits = useMemo(() => {
    if (options.length < 2) return null;
    return options.reduce((best, o) => (o.pricePerBill < best.pricePerBill ? o : best)).credits;
  }, [options]);

  const handlePurchase = async (option: CreditPackOption) => {
    if (!activeCompany || phase !== 'idle') return;
    const startCompanyId = activeCompany.id;
    startCompanyRef.current = { id: startCompanyId, name: activeCompany.name };

    let baseline = balance ?? 0;
    try {
      baseline = (await CreditsService.getCredits(startCompanyId)).balance;
    } catch {
      // Fall back to the balance already in context.
    }

    setPhase('purchasing');
    const result = await purchaseCredits(option.pkg);
    if (result === 'cancelled') {
      setPhase('idle');
      return;
    }
    if (result === 'error') {
      toast.error(t('creditsPurchaseFailed'));
      setPhase('idle');
      return;
    }

    setPhase('processing');
    const outcome = await pollForCreditIncrease({
      companyId: startCompanyId,
      baseline,
      fetch: CreditsService.getCredits.bind(CreditsService),
      isCancelled: () => cancelledRef.current,
    });

    if (outcome.status === 'credited') {
      toast.success(t('creditsAdded', { count: option.credits }));
      if (activeCompanyId === startCompanyId) await refresh();
      goBack();
    } else if (outcome.status === 'timeout') {
      // The webhook still arrives; the foreground/focus refresh picks it up.
      toast.info(t('creditsPurchasePending'));
      goBack();
    } else if (!cancelledRef.current) {
      goBack();
    }
  };

  if (isRoleLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('creditsBuyTitle')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  if (!canPurchase) return null;

  const canBuy = phase === 'idle' && isIdentityReady && balance !== null;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={t('creditsBuyTitle')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {balance !== null && (
          <View style={styles.balanceHeader}>
            <ThemedText variant="caption">{t('creditsTitle')}</ThemedText>
            <ThemedText style={styles.balance}>{balance}</ThemedText>
          </View>
        )}

        {!isIdentityReady && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <ThemedText variant="caption">{t('creditsStoreLoading')}</ThemedText>
          </View>
        )}

        {isIdentityReady && options.length === 0 && (
          <ThemedText variant="caption" style={styles.centerText}>
            {t('creditsNoPacks')}
          </ThemedText>
        )}

        {options.map((option) => (
          <TouchableOpacity
            key={option.pkg.identifier}
            accessibilityRole="button"
            disabled={!canBuy}
            onPress={() => handlePurchase(option)}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: option.credits === bestValueCredits ? colors.primary : colors.border,
                opacity: canBuy ? 1 : 0.6,
              },
            ]}
          >
            <View style={styles.cardText}>
              <ThemedText variant="subtitle">
                {t('creditsPackTitle', { count: option.credits })}
              </ThemedText>
              <ThemedText variant="caption">
                {t('creditsPricePerBill', {
                  price: formatPrice(option.pricePerBill, option.currencyCode, i18n.language),
                })}
              </ThemedText>
              {option.credits === bestValueCredits && (
                <View style={[styles.tag, { backgroundColor: colors.primary + '1A' }]}>
                  <ThemedText variant="caption" style={{ color: colors.primary }}>
                    {t('creditsBestValue')}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.price}>{option.pkg.product.priceString}</ThemedText>
          </TouchableOpacity>
        ))}

        {activeCompany && (
          <ThemedText variant="caption" style={styles.centerText}>
            {t('creditsNoExpiry', { company: activeCompany.name })}
          </ThemedText>
        )}
      </ScrollView>

      {phase !== 'idle' && (
        <View style={[styles.overlay, { backgroundColor: colors.background + 'E6' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          {phase === 'processing' && <ThemedText>{t('creditsProcessing')}</ThemedText>}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  centerText: {
    textAlign: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  balance: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: Typography.fontWeight.bold,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardText: {
    flex: 1,
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
