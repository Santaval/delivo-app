import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type ClientCardProps = {
  name: string;
  phone?: string;
  profileImage?: any; // Image source
  onPress?: () => void;
  onEditPress?: () => void;
  showEditIcon?: boolean;
};

export function ClientCard({
  name,
  phone,
  profileImage,
  onPress = () => console.log(`${name} pressed`),
  onEditPress = () => console.log(`Edit ${name} pressed`),
  showEditIcon = true,
}: ClientCardProps) {
  const colors = useThemeColor();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={profileImage || require('@/assets/images/user-placeholder.png')}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <ThemedText style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText variant="caption" style={styles.phone}>
            {phone}
          </ThemedText>
        </View>

        {/* Edit Icon */}
        {showEditIcon && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEditPress}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="edit" 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.background,
    ...Shadows.small,
  },
  imageContainer: {
    marginRight: Spacing.md,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0', // Fallback background
  },
  clientInfo: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs / 2,
  },
  phone: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  editButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
