import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";


const getStatusConfig = (status: OrderDeliveryStatus, colors: ReturnType<typeof useThemeColor>, t: (key: string) => string) => {
  switch (status) {
    case 'DELIVERED':
      return {
        label: t('delivered'),
        backgroundColor: colors.success + '20',
        textColor: colors.success,
      };
    case 'PENDING':
      return {
        label: t('deliveryPending'),
        backgroundColor: colors.warning + '20',
        textColor: colors.warning,
      };
    case 'IN_TRANSIT':
      return {
        label: t('inTransit'),
        backgroundColor: colors.info + '20',
        textColor: colors.info,
      };
    case "ON_ROUTE":
      return {
        label: t('onRoute'),
        backgroundColor: colors.info + '20',
        textColor: colors.info,
      };

    case "RETURNED":
      return {
        label: t('returned'),
        backgroundColor: colors.danger + '20',
        textColor: colors.danger,
      };
    default:
      return {
        label: t('unknown'),
        backgroundColor: colors.textTertiary + '20',
        textColor: colors.textTertiary,
      };
  }
};

export default function OrderStatusBadge({ status }: { status: OrderDeliveryStatus }) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const statusConfig = getStatusConfig(status, colors, t);

  return (
    <View style={[
      styles.statusBadge,
      { backgroundColor: statusConfig.backgroundColor }
    ]}>
      <ThemedText style={[
        styles.statusText,
        { color: statusConfig.textColor }
      ]}>
        {statusConfig.label}
      </ThemedText>
    </View>
  )
}


const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})