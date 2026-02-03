import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { View as RNView, ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'surface' | 'card' | 'primary' | 'success' | 'warning' | 'danger';
  backgroundColor?: string;
};

export function ThemedView({ 
  style, 
  variant = 'default',
  backgroundColor,
  ...rest 
}: ThemedViewProps) {
  const colors = useThemeColor();

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    switch (variant) {
      case 'surface':
        return colors.surface;
      case 'card':
        return colors.surfaceSecondary;
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      default:
        return colors.background;
    }
  };

  return (
    <RNView 
      style={[
        { backgroundColor: getBackgroundColor() },
        style,
      ]} 
      {...rest} 
    />
  );
}
