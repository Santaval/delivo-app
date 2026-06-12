import { ClientCard, EmptyState, ErrorState, FloatingActionButton, ListSkeleton, SearchBar, TopBar } from '@/components';
import { Spacing } from '@/constants';
import useClients from '@/hooks/useClients';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { clients, loading, error, searchClients, refresh } = useClients();
  const { t } = useTranslation();

  const handleAddClient = () => {
    router.push('/clients/add');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('clients')}
      />

      <SearchBar
        placeholder={t('searchClients')}
        onSearch={searchClients}
        showClearButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading && clients.length > 0} onRefresh={refresh} />
        }
      >
        {loading && clients.length === 0 ? (
          <ListSkeleton />
        ) : error && clients.length === 0 ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : clients.length > 0 ? (
          clients.map(client => (
            <ClientCard
              key={client.id}
              name={client.name}
              phone={client.phoneNumber}
              onPress={() => router.push(`/clients/profile/${client.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon="people"
            title={t('noClientsYet')}
            subtitle={t('noClientsYetSubtitle')}
            actionLabel={t('addNewClient')}
            onAction={handleAddClient}
          />
        )}
      </ScrollView>

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
  listContent: {
    flexGrow: 1,
  },
});
