import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

export type PrimaryButtonProps = {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ 
  title,
  variant = 'primary',
  size = 'medium',
  onPress = () => console.log(`${title} button pressed`),
  disabled = false,
  fullWidth = false,
  style,
}: PrimaryButtonProps) {
  const colors = useThemeColor();

  const getButtonStyles = () => {
    const baseStyle = {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      borderWidth: 1,
    };

    switch (variant) {
      case 'primary':
        return baseStyle;
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
          borderWidth: 1,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.textInverse;
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'danger':
        return colors.textInverse;
      default:
        return colors.textInverse;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: Spacing.md,
        };
      case 'medium':
        return {
          height: 44,
          paddingHorizontal: Spacing.lg,
        };
      case 'large':
        return {
          height: 52,
          paddingHorizontal: Spacing.xl,
        };
      default:
        return {
          height: 44,
          paddingHorizontal: Spacing.lg,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'medium':
        return Typography.fontSize.base;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.base;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getButtonStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedText 
        style={[
          styles.text,
          { 
            color: getTextColor(),
            fontSize: getTextSize(),
          }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    ...Shadows.small,
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.6,
  },
});
