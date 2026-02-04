import { ClientCard, TopBar } from '@/components';
import { Spacing } from '@/constants';
import useClients from '@/hooks/useClients';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { clients, loading, error } = useClients();

  if (loading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView>
        <Text>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        title='Clients'
      />
      {clients.map(client => (
        <ClientCard 
        key={client.id}
        name={client.name}
        phone={client.phoneNumber}

      />
      ))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
});
