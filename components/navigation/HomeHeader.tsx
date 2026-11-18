import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Shadows, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { usePurchases } from '@/context/PurchasesContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type NavItem = {
  labelKey: string;
  href: Href;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

/** Destinos secundarios (los 4 de la tab bar no se repiten acá). Para agregar
 *  uno: una entrada acá + una ruta bajo app/ + un <Stack.Screen> en app/_layout.tsx. */
const NAV_ITEMS: NavItem[] = [
  { labelKey: 'bills', href: Routes.bills, icon: 'receipt' },
  { labelKey: 'products', href: Routes.products, icon: 'inventory-2' },
  { labelKey: 'team', href: Routes.team, icon: 'groups' },
  // Account is reached from the avatar on the right of the header.
];

/** Encabezado de Home: empresa activa (abre el selector) + fila horizontal de secciones. */
export function HomeHeader() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { user, syncUserIfStale } = useAuth();
  const { activeCompany, companies } = useCompanies();
  const { isPro } = usePurchases();

  // Pick up membership changes (added to / removed from a company) whenever Home
  // gains focus; throttled inside syncUserIfStale.
  useFocusEffect(
    useCallback(() => {
      syncUserIfStale();
    }, [syncUserIfStale]),
  );

  const canSwitchCompany = companies.length > 1;
  const userName = user ? `${user.name} ${user.surnames}`.trim() : undefined;

  const companyContent = (
    <>
      <View style={[styles.companyDot, { backgroundColor: colors.primary }]} />
      <ThemedText style={styles.companyName} numberOfLines={1}>
        {activeCompany?.name ?? t('home')}
      </ThemedText>
      {canSwitchCompany && <MaterialIcons name="expand-more" size={18} color={colors.textSecondary} />}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.companyBlock}>
          {canSwitchCompany && activeCompany ? (
            <TouchableOpacity
              style={styles.companyRow}
              accessibilityRole="button"
              accessibilityLabel={`${t('switchCompany')}: ${activeCompany.name}`}
              hitSlop={{ top: 8, bottom: 8 }}
              onPress={() => router.push(Routes.companiesSwitch)}
            >
              {companyContent}
            </TouchableOpacity>
          ) : (
            <View style={styles.companyRow}>{companyContent}</View>
          )}
          {userName ? (
            <ThemedText variant="caption" style={[styles.userName, { color: colors.textSecondary }]} numberOfLines={1}>
              {userName}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.rightSection}>
          {isPro && (
            <View style={[styles.proPill, { backgroundColor: colors.warning }]}>
              <ThemedText style={styles.proPillText}>Pro</ThemedText>
            </View>
          )}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.navigate(Routes.account)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('account')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={require('@/assets/images/user-placeholder.png')}
              style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navScroll}
        contentContainerStyle={styles.navContent}
      >
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.labelKey}
            style={[styles.navItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
            onPress={() => router.push(item.href)}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <MaterialIcons name={item.icon} size={18} color={colors.primary} />
            </View>
            <ThemedText style={styles.navLabel}>{t(item.labelKey)}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  companyBlock: {
    flex: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 44,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  companyDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  companyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flexShrink: 1,
  },
  userName: {
    marginTop: -Spacing.xs,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  proPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  proPillText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  avatarButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  // Bleed the row to the screen edges (Home's container pads Spacing.lg).
  navScroll: {
    marginHorizontal: -Spacing.lg,
  },
  navContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs, // room for the pill shadows
    gap: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    ...Shadows.small,
  },
  navIcon: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
