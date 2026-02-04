import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spacing, Typography } from '@/constants';

export type TopBarProps = {
  title: string;
  userName?: string;
  userImage?: any; // Image source
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onUserPress?: () => void;
};

export function TopBar({
  title,
  userName,
  userImage,
  showNotification = true,
  notificationCount,
  onNotificationPress = () => console.log('Notification pressed'),
  onUserPress = () => console.log('User profile pressed'),
}: TopBarProps) {
  const colors = useThemeColor();

  return (
    <ThemedView style={styles.container}>
      {/* Left side - User info */}
      <TouchableOpacity 
        style={styles.userSection}
        onPress={onUserPress}
        activeOpacity={0.7}
      >
        <Image 
          source={userImage || require('@/assets/images/user-placeholder.png')}
          style={styles.userImage}
          resizeMode="cover"
        />
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
      </TouchableOpacity>

      {/* Right side - Notification */}
      {showNotification && (
        <TouchableOpacity 
          style={styles.notificationContainer}
          onPress={onNotificationPress}
          activeOpacity={0.7}
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
    backgroundColor: '#f0f0f0', // Fallback background
  },
  userInfo: {
    flex: 1,
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
