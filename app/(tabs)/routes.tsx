import { FloatingActionButton, TopBar } from '@/components';
import { RoutesList } from '@/components/RoutesList';
import { Spacing } from '@/constants';
import useRoutes from '@/hooks/useRoutes';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Clients() {
  const { routes, loading, refresh } = useRoutes();
  const { t } = useTranslation();

  const handleAddRoute = () => {
    router.push('/routes/create');
  };


  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t("routes")}
      />

      {/* <SearchBar
        onSearch={searchClients}
        showClearButton
      /> */}

      <RoutesList 
        routes={routes}
        onRoutePress={(routeId) => {
          router.push(`/routes/view/${routeId}`);
        }}

        isRefreshing={loading}
        onRefresh={refresh}
      />
      
      <FloatingActionButton
        onPress={handleAddRoute}
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
