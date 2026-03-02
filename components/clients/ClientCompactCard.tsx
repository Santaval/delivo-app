import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';


type Props = {
  client: Client
}

export default function ClientCompactCard({ client }: Props) {
  const colors = useThemeColor();

  return (
    <Pressable style={[styles.clientCard, { backgroundColor: colors.surface }]}
    onPress={() => router.push(`/clients/profile/${client.id}`)}
    >
      <View style={styles.clientHeader}>
        <View style={[styles.clientAvatar, { backgroundColor: colors.primary }]}>
          <ThemedText style={[styles.clientAvatarText, { color: colors.textInverse }]}>
            {client.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.clientInfo}>
          <ThemedText style={[styles.clientName, { color: colors.text }]}>
            {client.name}
          </ThemedText>
          <ThemedText style={[styles.clientContact, { color: colors.textSecondary }]}>
            {client.phoneNumber || 'N/A'}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  clientCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  clientAvatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  clientContact: {
    fontSize: Typography.fontSize.sm,
  },
})