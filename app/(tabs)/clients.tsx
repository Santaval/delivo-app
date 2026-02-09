import { ClientCard, FloatingActionButton, SearchBar, TopBar } from '@/components';
import { Spacing } from '@/constants';
import useClients from '@/hooks/useClients';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { clients, loading, error, searchClients, refresh } = useClients();

  const handleAddClient = () => {
    router.push('/clients/add');
  };


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

      <SearchBar
        onSearch={searchClients}
        showClearButton
      />

      {!loading ? <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        {clients.map(client => (
          <ClientCard
            key={client.id}
            name={client.name}
            phone={client.phoneNumber}
            onPress={() => router.push(`/clients/profile/${client.id}`)}
          />
        ))}
      </ScrollView> : <Text>Loading...</Text>}

      <FloatingActionButton
        onPress={handleAddClient}
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
