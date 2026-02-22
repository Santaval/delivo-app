import { PrimaryButton, ThemedText, ThemedView } from '@/components';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import usePaymentMethods from '@/hooks/usePaymentMethods';
import OrdersService from '@/services/orders/Orders.service';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type RecordPaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  remainingBalance: number;
  onPaymentRecorded?: () => void;
};

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  orderId,
  remainingBalance,
  onPaymentRecorded,
}) => {
  const colors = useThemeColor();
  const { loading, paymentMethods } = usePaymentMethods();
  
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [amount, setAmount] = useState<string>('0.00');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  const handlePayFull = () => {
    setAmount(remainingBalance.toFixed(2));
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethodId || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsProcessing(true);
    
    await OrdersService.addPayment(orderId, parseFloat(amount), selectedMethodId);


    // Reset form
    setSelectedMethodId('');
    setAmount('0.00');
    
    // Notify parent
    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
    
    onClose();
  };

  const handleCancel = () => {
    setSelectedMethodId('');
    setAmount('0.00');
    setShowMethodDropdown(false);
    onClose();
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(cleaned);
  };

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
              {/* Header */}
              <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Record Payment
            </ThemedText>
            <TouchableOpacity
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.section}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Payment Method
            </ThemedText>
            
            {loading ? (
              <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setShowMethodDropdown(!showMethodDropdown)}
              >
                <ThemedText style={[styles.dropdownText, { color: selectedMethod ? colors.text : colors.textSecondary }]}>
                  {selectedMethod ? selectedMethod.name : 'Select Payment Method'}
                </ThemedText>
                <MaterialIcons 
                  name={showMethodDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            )}

            {/* Dropdown Options */}
            {showMethodDropdown && !loading && (
              <View style={[
                styles.dropdownOptions,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                Platform.OS === 'ios' ? Shadows.medium : {},
              ]}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: colors.border },
                      selectedMethodId === method.id && { backgroundColor: colors.background }
                    ]}
                    onPress={() => {
                      setSelectedMethodId(method.id);
                      setShowMethodDropdown(false);
                    }}
                  >
                    <ThemedText style={[styles.dropdownOptionText, { color: colors.text }]}>
                      {method.name}
                    </ThemedText>
                    {selectedMethodId === method.id && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <View style={styles.amountHeader}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Amount to Pay
              </ThemedText>
              <TouchableOpacity onPress={handlePayFull}>
                <ThemedText style={[styles.payFullButton, { color: colors.primary }]}>
                  Pay Full
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={[
              styles.amountInputContainer,
              { 
                backgroundColor: colors.background,
                borderColor: colors.border,
              }
            ]}>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <PrimaryButton
              title="Confirm Payment"
              onPress={handleConfirmPayment}
              disabled={isProcessing || !selectedMethodId || !amount || parseFloat(amount) <= 0}
              style={styles.confirmButton}
            />
            
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </TouchableOpacity>
    </TouchableOpacity>
  </KeyboardAvoidingView>
</Modal>
  );
};

/**
 * Mock function to simulate recording a payment
 * TODO: Replace with actual API service call
 * 
 * @param data Payment data containing orderId, paymentMethodId, and amount
 */
const mockRecordPayment = async (data: {
  orderId: string;
  paymentMethodId: string;
  amount: number;
}): Promise<void> => {
  console.log('Recording payment:', data);
  
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Payment recorded successfully');
      resolve();
    }, 1000);
  });
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: Typography.fontSize.base,
  },
  loadingContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: Typography.fontSize.base,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  payFullButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.medium,
    padding: 0,
  },
  remainingBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  remainingLabel: {
    fontSize: Typography.fontSize.sm,
  },
  remainingAmount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  actions: {
    marginTop: Spacing.md,
  },
  confirmButton: {
    marginBottom: Spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  cancelText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default RecordPaymentModal;
