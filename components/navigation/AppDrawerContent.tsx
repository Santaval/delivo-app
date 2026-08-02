import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Routes, Spacing, Typography } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useCompanies } from '@/context/CompaniesContext';
import { usePurchases } from '@/context/PurchasesContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type DrawerEntry = {
  labelKey: string;
  href: Href;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

/** Destinos secundarios. Los 4 destinos de la tab bar están deliberadamente
 *  ausentes: el drawer no debe duplicar la tab bar. Para agregar uno nuevo:
 *  una entrada acá + una ruta bajo app/ (p.ej. app/<name>.tsx) + un
 *  <Stack.Screen name="<name>" /> en app/_layout.tsx. */
const DRAWER_ENTRIES: DrawerEntry[] = [
  { labelKey: 'bills', href: Routes.bills, icon: 'receipt' },
  { labelKey: 'products', href: Routes.products, icon: 'inventory-2' },
  { labelKey: 'account', href: Routes.account, icon: 'person' },
];

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeCompany } = useCompanies();
  const { isPro } = usePurchases();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
          <MaterialIcons name="person" size={28} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.headerNameRow}>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {user?.name} {user?.surnames}
            </ThemedText>
            {isPro && (
              <View style={[styles.proPill, { backgroundColor: colors.warning }]}>
                <ThemedText style={styles.proPillText}>Pro</ThemedText>
              </View>
            )}
          </View>
          {activeCompany?.name && (
            <ThemedText variant="caption" style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
              {activeCompany.name}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <ThemedText variant="caption" style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        {t('navigation')}
      </ThemedText>

      {DRAWER_ENTRIES.map((entry) => (
        <TouchableOpacity
          key={entry.labelKey}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={t(entry.labelKey)}
          onPress={() => {
            router.push(entry.href); // push: son rutas del stack raíz, no hermanas del drawer
            props.navigation.closeDrawer(); // el drawer sigue montado debajo del push, hay que cerrarlo explícitamente
          }}
        >
          <MaterialIcons name={entry.icon} size={24} color={colors.textSecondary} />
          <ThemedText style={styles.rowLabel}>{t(entry.labelKey)}</ThemedText>
        </TouchableOpacity>
      ))}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flexShrink: 1,
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
  company: {
    marginTop: Spacing.xs / 2,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginHorizontal: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  rowLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});
