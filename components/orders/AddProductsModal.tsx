import { OrderItem, PrimaryButton, ProductSelect, ThemedView } from '@/components';
import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

type RecordPaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (items: OrderItem[]) => void;
};

const AddProductsModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const colors = useThemeColor();

  const [orderItems, setOrderItems] = React.useState<OrderItem[]>([]);
  const { t } = useTranslation();

  const handleCancel = () => {
    onClose();
  };

  const handleAddProducts = () => {
    console.log("Adding products:", orderItems);
    onAdd(orderItems);
    setOrderItems([]);
    onClose();
  }



  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.overlay}
          onPress={handleCancel}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ThemedView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
              <ProductSelect 
                label={t("products")}
                onProductsChange={(setOrderItems)}
                placeholder={t("addProductsToOrder")}
                disableTotal
              />

              <PrimaryButton
                title={t("addProducts")}
                onPress={handleAddProducts}
              />
            </ThemedView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};



const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 20, // Extra padding for safe area
    elevation: 8,
    ...(Platform.OS === 'ios' ? Shadows.large : {}),
  },
});

export default AddProductsModal;
