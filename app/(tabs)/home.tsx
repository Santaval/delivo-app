import { IncomeCard, IncomeTrendsChart, QuickLinks, TopBar } from '@/components';
import { Spacing } from '@/constants';
import { useThemeColor } from '@/hooks';
import useFinancialSummary from '@/hooks/useFinanancialSummary';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { data, loading } = useFinancialSummary();

  const colors = useThemeColor();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!data) {
    return null;
  }


  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        title='Home'
      />
      <IncomeCard
        amount={data.incomes.total}
        title='Monthly Income'
        percentage={data.incomes.increasePercentage || 0}
        timeStamp='Since last month'
      />
      <IncomeTrendsChart
        data={Object.entries(data.incomes.byDay).map(([label, value]) => ({ label, value })) as any}
        title='Income Trends'
        averageValue={data.incomes.averagePerDay}
      />

      <QuickLinks 
        links={[

          {
            icon: <MaterialIcons name="people" size={24} color={colors.textInverse} />,
            id: 'clients',
            title: 'Clients',
            subtitle: 'View detailed client information',
              onPress: () => router.push('/'),
            },

          {
            icon: <MaterialCommunityIcons name="package" size={24} color={colors.textInverse} />,
            id: 'products',
            title: 'Products',
            subtitle: 'View detailed product information',
              onPress: () => router.push('/'),
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