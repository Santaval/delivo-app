import { FloatingActionButton, TopBar } from '@/components';
import { OrdersList } from '@/components/OrdersList';
import { Spacing } from '@/constants';
import useOrders from '@/hooks/useOrders';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { orders, loading, error,  } = useOrders();

  const handleAddOrder = () => {
    router.push('/orders/create');
  };

  if (loading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title='Orders'
      />

      {/* <SearchBar
        onSearch={searchClients}
        showClearButton
      /> */}

      <OrdersList 
        orders={orders}
      />
      
      <FloatingActionButton
        onPress={handleAddOrder}
        icon="add"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
});
