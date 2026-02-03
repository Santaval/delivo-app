import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useColorScheme';
import { Typography } from '@/constants/Theme';

export type ThemedTextProps = TextProps & {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'link' | 'success' | 'warning' | 'danger';
  color?: string;
};

export function ThemedText({ 
  style, 
  variant = 'default',
  color,
  ...rest 
}: ThemedTextProps) {
  const colors = useThemeColor();

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'title':
        return {
          fontSize: Typography.fontSize['2xl'],
          fontWeight: Typography.fontWeight.bold,
          color: color || colors.text,
        };
      case 'subtitle':
        return {
          fontSize: Typography.fontSize.lg,
          fontWeight: Typography.fontWeight.semibold,
          color: color || colors.text,
        };
      case 'caption':
        return {
          fontSize: Typography.fontSize.sm,
          color: color || colors.textSecondary,
        };
      case 'link':
        return {
          fontSize: Typography.fontSize.base,
          color: color || colors.primary,
          textDecorationLine: 'underline',
        };
      case 'success':
        return {
          fontSize: Typography.fontSize.base,
          color: color || colors.success,
          fontWeight: Typography.fontWeight.medium,
        };
      case 'warning':
        return {
          fontSize: Typography.fontSize.base,
          color: color || colors.warning,
          fontWeight: Typography.fontWeight.medium,
        };
      case 'danger':
        return {
          fontSize: Typography.fontSize.base,
          color: color || colors.danger,
          fontWeight: Typography.fontWeight.medium,
        };
      default:
        return {
          fontSize: Typography.fontSize.base,
          color: color || colors.text,
        };
    }
  };

  return (
    <RNText 
      style={[
        getVariantStyles(),
        style,
      ]} 
      {...rest} 
    />
  );
}
