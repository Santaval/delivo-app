import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";


export default function OrderStatusBadge({ status }: { status: OrderDeliveryStatus }) {
  const { t } = useTranslation();
  const getStatusConfig = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'DELIVERED':
        return {
          label: t('delivered'),
          backgroundColor: Colors.light.success + '20',
          textColor: Colors.light.success,
        };
      case 'PENDING':
        return {
          label: t('deliveryPending'),
          backgroundColor: Colors.light.warning + '20',
          textColor: Colors.light.warning,
        };
      case 'IN_TRANSIT':
        return {
          label: t('inTransit'),
          backgroundColor: Colors.light.info + '20',
          textColor: Colors.light.info,
        };
      case "ON_ROUTE":
        return {
          label: t('onRoute'),
          backgroundColor: Colors.light.info + '20',
          textColor: Colors.light.info,
        };

      case "RETURNED":
        return {
          label: t('returned'),
          backgroundColor: Colors.light.danger + '20',
          textColor: Colors.light.danger,
        };
      default:
        return {
          label: t('unknown'),
          backgroundColor: Colors.light.textTertiary + '20',
          textColor: Colors.light.textTertiary,
        };
    }
  };

  const statusConfig = getStatusConfig(status);

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