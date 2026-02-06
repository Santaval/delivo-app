import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppleIcon, GoogleIcon } from './icons';
import { ThemedText } from './ThemedText';

export type SocialButtonProps = {
  provider: 'google' | 'apple';
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean; 
};

export function SocialButton({ 
  provider, 
  onPress = () => console.log(`${provider} login pressed`),
  disabled = false,
  isLoading
}: SocialButtonProps) {
  const colors = useThemeColor();

  const getButtonStyles = () => {
    switch (provider) {
      case 'google':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'apple':
        return {
          backgroundColor: '#1D1D1F', // Apple's standard black
          borderColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (provider) {
      case 'google':
        return colors.text;
      case 'apple':
        return '#ffffff';
      default:
        return colors.text;
    }
  };

  const getButtonText = () => {
    switch (provider) {
      case 'google':
        return 'Continue with Google';
      case 'apple':
        return 'Continue with Apple';
      default:
        return 'Continue';
    }
  };

  const renderIcon = () => {
    switch (provider) {
      case 'google':
        return <GoogleIcon width={20} height={20} />;
      case 'apple':
        return <AppleIcon width={20} height={20} color="#ffffff" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getButtonStyles(),
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
        <ThemedText 
          style={[
            styles.text,
            { color: getTextColor() }
          ]}
        >
          {isLoading ? "Solo un momento..." : getButtonText()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: BorderRadius['3xl'],
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
