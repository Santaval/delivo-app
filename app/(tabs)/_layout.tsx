import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useThemeColor } from '@/hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.background,
          },
          default: {
            backgroundColor: colors.background,
          },
        }),
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: t('orders'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-basket" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='bills'
        options={{
          title: t('bills'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='products'
        options={{
          title: t('products'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="package" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='clients'
        options={{
          title: t('clients'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='routes'
        options={{
          title: t('routes'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: t('account'),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
