import { FloatingActionButton, TopBar } from '@/components';
import { RoutesList } from '@/components/RoutesList';
import { Routes, Spacing } from '@/constants';
import { useDrawer } from '@/hooks';
import useRoutes from '@/hooks/useRoutes';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoutesScreen() {
  const { routes, loading, error, refresh } = useRoutes();
  const { t } = useTranslation();
  const { openDrawer } = useDrawer();

  const handleAddRoute = () => {
    router.push(Routes.routesCreate);
  };


  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t("routes")}
        onMenuPress={openDrawer}
      />

      {/* <SearchBar
        onSearch={searchClients}
        showClearButton
      /> */}

      <RoutesList
        routes={routes}
        onRoutePress={(routeId) => {
          router.push(Routes.routeView(routeId));
        }}

        isRefreshing={loading && routes.length > 0}
        loading={loading && routes.length === 0}
        error={error}
        onRefresh={refresh}
        onCreateFirst={handleAddRoute}
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
