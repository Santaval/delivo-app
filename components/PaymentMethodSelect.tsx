import { ThemedText } from '@/components';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import usePaymentMethods from '@/hooks/usePaymentMethods';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type PaymentMethodSelectProps = {
  value: string;
  onChange: (methodId: string) => void;
  placeholder?: string;
  onAddNew?: () => void;
};

const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = ({
  value,
  onChange,
  placeholder = 'Select Payment Method',
  onAddNew,
}) => {
  const colors = useThemeColor();
  const { loading, paymentMethods } = usePaymentMethods();
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedMethod = paymentMethods.find(m => m.id === value);

  const handleSelect = (methodId: string) => {
    onChange(methodId);
    setShowDropdown(false);
  };

  const handleAddNew = () => {
    setShowDropdown(false);
    if (onAddNew) {
      onAddNew();
    } else {
      router.push('/payment-methods/add');
    }
  };

  return (
    <View style={styles.container}>
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
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <ThemedText 
            style={[
              styles.dropdownText, 
              { color: selectedMethod ? colors.text : colors.textSecondary }
            ]}
          >
            {selectedMethod ? selectedMethod.name : placeholder}
          </ThemedText>
          <MaterialIcons 
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}

      {/* Dropdown Options */}
      {showDropdown && !loading && (
        <View 
          style={[
            styles.dropdownOptions,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            Platform.OS === 'ios' ? Shadows.medium : {},
          ]}
        >
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.dropdownOption,
                { borderBottomColor: colors.border },
                value === method.id && { backgroundColor: colors.background }
              ]}
              onPress={() => handleSelect(method.id)}
            >
              <ThemedText style={[styles.dropdownOptionText, { color: colors.text }]}>
                {method.name}
              </ThemedText>
              {value === method.id && (
                <MaterialIcons name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
          
          {/* Add New Method Option */}
          <TouchableOpacity
            style={[
              styles.dropdownOption,
              styles.addNewOption,
              { borderBottomColor: colors.border, borderTopColor: colors.border }
            ]}
            onPress={handleAddNew}
          >
            <View style={styles.addNewContent}>
              <MaterialIcons name="add-circle-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.addNewText, { color: colors.primary }]}>
                Add New Method
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
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
    top: 52,
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
  addNewOption: {
    borderTopWidth: 1,
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
  },
  addNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addNewText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default PaymentMethodSelect;
export type { PaymentMethodSelectProps };
