import RouteScreenManager from '@/components/routes/screens/RouteScreenManager';
import { RoutesViewParams } from '@/constants';
import { RouteProvider } from '@/context/RouteContext';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function RouteView() {
  const { id } = useLocalSearchParams<RoutesViewParams>();

  return (
    <RouteProvider routeId={id}>
      <RouteScreenManager />
    </RouteProvider>
  )
}