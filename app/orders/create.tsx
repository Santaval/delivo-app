import { ClientSelect, TopBar } from '@/components';
import { Spacing } from '@/constants';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function create() {
  // load client id param from route params
  const route = useRoute();
  const { clientId } = route.params as { clientId?: string };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title='Create Order'
      />
      <ClientSelect
        label="ASSIGNED CLIENT"
        defaultClientId={clientId}
        onClientSelect={client => console.log('Selected client:', client)}
        onClientClear={() => console.log('Client selection cleared')}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});