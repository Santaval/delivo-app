import { Routes, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type TopBarProps = {
  title: string;
  userName?: string;
  userImage?: any; // Image source
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onUserPress?: () => void;
  showBack?: boolean;
  backTo?: Href;
  /** Renderiza la hamburguesa a la izquierda. Solo desde pantallas bajo app/(drawer)/. */
  onMenuPress?: () => void;
};

export function TopBar({
  title,
  userName,
  userImage,
  showNotification = true,
  notificationCount,
  onNotificationPress,
  onUserPress,
  showBack = false,
  backTo,
  onMenuPress,
}: TopBarProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) router.back();
    else if (backTo) router.replace(backTo);
    else router.replace(Routes.home);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Left side - back button wins over the hamburger if both are passed */}
      {showBack ? (
        <TouchableOpacity
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back-ios" size={28} color={colors.primary} />
        </TouchableOpacity>
      ) : onMenuPress ? (
        <TouchableOpacity
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel={t('openMenu')}
          accessibilityHint={t('openMenuHint')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.iconButton}
        >
          <MaterialIcons name="menu" size={28} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.userInfo}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
        {userName && (
          <ThemedText variant="caption" style={styles.userName}>
            {userName}
          </ThemedText>
        )}
      </View>

      <View style={styles.rightSection}>
        {/* Notification (only rendered when a handler exists) */}
        {showNotification && onNotificationPress && (
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={onNotificationPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('notifications')}
          >
            <View style={styles.notificationIcon}>
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={colors.text}
              />
              {notificationCount !== undefined && notificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <ThemedText style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount.toString()}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Account avatar (only rendered when a handler exists) */}
        {onUserPress && (
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onUserPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('account')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={userImage || require('@/assets/images/user-placeholder.png')}
              style={styles.userImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'transparent',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // Fallback background
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: Spacing.xs,
  },
  avatarButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs / 2,
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  notificationContainer: {
    padding: Spacing.sm,
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
});
