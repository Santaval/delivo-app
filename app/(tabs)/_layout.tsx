import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: Colors.light.background,
          },
          default: {
            backgroundColor: Colors.light.background,
          },
        }),
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='products'
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="package" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='clients'
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
