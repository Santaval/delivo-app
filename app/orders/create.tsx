import { ClientSelect, OrderItem, PrimaryButton, ProductSelect, TopBar } from '@/components';
import { Spacing } from '@/constants';
import OrdersService from '@/services/orders/Orders.service';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateOrder() {
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  const [clientId, setClientId] = React.useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const { t } = useTranslation();
  // load client id param from route params
  const route = useRoute();
  const { clientId: defaultClientId } = route.params as { clientId?: string };

  useEffect(() => {
    setClientId(defaultClientId);
  }, [defaultClientId]);

  const handleSaveOrder = async  () => {
    try {
      setIsSaving(true);
      // create order
      const order = await OrdersService.create({
        clientId,
      });

      // add items
      for (const item of orderItems) {
        await OrdersService.addItemToOrder(order.id, {
          productId: item.product.id,
          quantity: item.quantity,
        });
      }

      router.push(`/orders/view/${order.id}`);

    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('createOrder')}
        goBackTo='/orders'
      />
      <ClientSelect
        label={t("assignedClient").toUpperCase()}
        placeholder={t("chooseClient")}
        defaultClientId={defaultClientId}
        onClientSelect={client => setClientId(client.id)}
        onClientClear={() => setClientId(undefined)}
      />

      <ProductSelect
        label={t("products")}
        maxItems={100}
        // error={orderItems.length === 0 ? "Please add products" : undefined}
        onProductsChange={setOrderItems}
      />

      <PrimaryButton
        title={t('saveOrder')}
        onPress={handleSaveOrder}
        disabled={!clientId || orderItems.length === 0 || isSaving}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
});