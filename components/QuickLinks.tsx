import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { QuickLinkCard, type QuickLinkCardProps } from './QuickLinkCard';
import { BorderRadius, Spacing, Shadows } from '@/constants';

export type QuickLinkData = Omit<QuickLinkCardProps, 'onPress'> & {
  id: string;
  onPress?: () => void;
};

export type QuickLinksProps = {
  title?: string;
  links: QuickLinkData[];
  variant?: 'card' | 'flat';
  onLinkPress?: (linkId: string) => void;
};

export function QuickLinks({
  title = 'Quick Links',
  links,
  variant = 'card',
  onLinkPress,
}: QuickLinksProps) {

  const handleLinkPress = (link: QuickLinkData) => {
    if (link.onPress) {
      link.onPress();
    } else if (onLinkPress) {
      onLinkPress(link.id);
    }
  };

  const containerStyle = variant === 'card' ? styles.cardContainer : styles.flatContainer;

  return (
    <ThemedView style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
      </View>

      {/* Links */}
      <View style={styles.linksContainer}>
        {links.map((link) => (
          <QuickLinkCard
            key={link.id}
            title={link.title}
            subtitle={link.subtitle}
            icon={link.icon}
            iconColor={link.iconColor}
            showChevron={link.showChevron}
            onPress={() => handleLinkPress(link)}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    ...Shadows.small,
  },
  flatContainer: {
    padding: Spacing.lg,
    marginVertical: Spacing.xs,
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  linksContainer: {
    gap: Spacing.xs,
  },
});
