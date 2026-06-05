import { IncomeCard, IncomeTrendsChart, QuickLinks, TopBar } from '@/components';
import { Spacing } from '@/constants';
import { useThemeColor } from '@/hooks';
import useFinancialSummary from '@/hooks/useFinanancialSummary';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { data, loading } = useFinancialSummary();
  const { t } = useTranslation();

  const colors = useThemeColor();

  if (loading) {
    return <Text>{t('loading')}...</Text>;
  }

  if (!data) {
    return null;
  }


  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('home')}
      />
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

      <QuickLinks
        title={t('quickLinks')}
        links={[

          {
            icon: <MaterialIcons name="people" size={24} color={colors.textInverse} />,
            id: 'clients',
            title: t('clients'),
            subtitle: t('viewDetailedClientInformation'),
            onPress: () => router.push('/(tabs)/clients'),
          },

          {
            icon: <MaterialIcons name="shopping-cart" size={28} color={colors.textInverse} />,
            id: 'orders',
            title: t('orders'),
            subtitle: t('viewDetailedOrderInformation'),
            onPress: () => router.push('/(tabs)/orders'),
          },

          {
            icon: <MaterialIcons name="receipt" size={28} color={colors.textInverse} />,
            id: 'invoices',
            title: t('bills'),
            subtitle: t('viewDetailedBillInformation'),
            onPress: () => router.push('/(tabs)/bills'),
          },

          {
            icon: <MaterialCommunityIcons name="package" size={24} color={colors.textInverse} />,
            id: 'products',
            title: t('products'),
            subtitle: t('viewDetailedProductInformation'),
            onPress: () => router.push('/(tabs)/products'),
          },

          {
            icon: <MaterialIcons name="map" size={28} color={colors.textInverse} />,
            id: 'routes',
            title: t('routes'),
            subtitle: t('viewDetailedRouteInformation'),
            onPress: () => router.push('/(tabs)/routes'),
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
});