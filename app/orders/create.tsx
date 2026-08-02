import { ClientSelect, OrderItem, PrimaryButton, ProductSelect, TopBar } from '@/components';
import { OrdersCreateParams, Routes, Spacing } from '@/constants';
import { useToast } from '@/context/ToastContext';
import OrdersService from '@/services/orders/Orders.service';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateOrder() {
  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  const [clientId, setClientId] = React.useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const toast = useToast();
  const { clientId: defaultClientId } = useLocalSearchParams<OrdersCreateParams>();

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

      router.push(Routes.orderView(order.id));

    } catch (error) {
      console.error('Error saving order:', error);
      toast.show({ message: t('failedToCreateOrder'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        title={t('createOrder')}
        showBack
        backTo={Routes.tabOrders}
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