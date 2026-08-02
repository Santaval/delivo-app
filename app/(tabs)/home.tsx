import { EmptyState, ErrorState, IncomeCard, IncomeTrendsChart, PrimaryButton, QuickLinks, SkeletonBox, TopBar } from '@/components';
import { BorderRadius, Routes, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks';
import useFinancialSummary from '@/hooks/useFinanancialSummary';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { data, loading, error, refresh } = useFinancialSummary();
  const { t } = useTranslation();

  const colors = useThemeColor();

  if (loading) {
    const shimmerColor = colors.backgroundSecondary;
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('home')} />
        <SkeletonBox style={[styles.skeletonCard, { backgroundColor: shimmerColor }]} />
        <SkeletonBox style={[styles.skeletonChart, { backgroundColor: shimmerColor }]} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={t('home')} />
        <ErrorState message={error ?? undefined} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  const isGettingStarted = data.incomes.total === 0;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('home')}
      />
      {isGettingStarted ? (
        <View style={styles.gettingStarted}>
          <EmptyState
            icon="storefront"
            title={t('gettingStartedTitle')}
            subtitle={t('gettingStartedSubtitle')}
            actionLabel={t('addFirstClient')}
            onAction={() => router.push(Routes.clientsAdd)}
          />
          <PrimaryButton
            title={t('addFirstProduct')}
            variant="outline"
            onPress={() => router.push(Routes.productsAdd)}
            style={styles.secondaryCta}
          />
        </View>
      ) : (
        <>
          <IncomeCard
            amount={data.incomes.total}
            title={t('monthlyIncome')}
            percentage={data.incomes.increasePercentage || 0}
            timeStamp={t('sinceLastMonth')}
          />
          <IncomeTrendsChart
            data={Object.entries(data.incomes.byDay).map(([label, value]) => ({ label, value })) as any}
            title={t('incomeTrends')}
            averageValue={data.incomes.averagePerDay}
          />
        </>
      )}

      <QuickLinks
        title={t('quickLinks')}
        links={[

          {
            icon: <MaterialIcons name="people" size={24} color={colors.textInverse} />,
            id: 'clients',
            title: t('clients'),
            subtitle: t('viewDetailedClientInformation'),
            onPress: () => router.push(Routes.tabClients),
          },

          {
            icon: <MaterialIcons name="shopping-cart" size={28} color={colors.textInverse} />,
            id: 'orders',
            title: t('orders'),
            subtitle: t('viewDetailedOrderInformation'),
            onPress: () => router.push(Routes.tabOrders),
          },

          {
            icon: <MaterialIcons name="receipt" size={28} color={colors.textInverse} />,
            id: 'invoices',
            title: t('bills'),
            subtitle: t('viewDetailedBillInformation'),
            onPress: () => router.push(Routes.tabBills),
          },

          {
            icon: <MaterialCommunityIcons name="package" size={24} color={colors.textInverse} />,
            id: 'products',
            title: t('products'),
            subtitle: t('viewDetailedProductInformation'),
            onPress: () => router.push(Routes.tabProducts),
          },

          {
            icon: <MaterialIcons name="map" size={28} color={colors.textInverse} />,
            id: 'routes',
            title: t('routes'),
            subtitle: t('viewDetailedRouteInformation'),
            onPress: () => router.push(Routes.tabRoutes),
          },

        ]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing['3xl']
  },
  skeletonCard: {
    height: 120,
    borderRadius: BorderRadius.xl,
  },
  skeletonChart: {
    height: 220,
    borderRadius: BorderRadius.xl,
  },
  gettingStarted: {
    gap: Spacing.sm,
  },
  secondaryCta: {
    marginHorizontal: Spacing.xl,
  },
});