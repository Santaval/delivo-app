import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      // The visible bar is the global FloatingTabBar (app/_layout.tsx), which is
      // also shown over pushed screens; this navigator only does the routing.
      tabBar={() => null}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: t('home') }} />
      <Tabs.Screen name="orders" options={{ title: t('orders') }} />
      <Tabs.Screen name="routes" options={{ title: t('routes') }} />
      <Tabs.Screen name="clients" options={{ title: t('clients') }} />
    </Tabs>
  );
}
