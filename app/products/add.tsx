import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import ProductsService from '@/services/products/Products.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Zod validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  grossPrice: z.number().min(0.01, 'Gross price must be greater than 0'),
  ivaRate: z.number().min(0, 'IVA rate cannot be negative').max(100, 'IVA rate cannot exceed 100%'),
});


export default function AddProduct() {
  const colors = useThemeColor();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [name, setName] = useState('');
  const [grossPriceText, setGrossPriceText] = useState('0.00');
  const [ivaRate, setIvaRate] = useState(13);
  
  // Calculated values
  const [grossPrice, setGrossPrice] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);

  // IVA rate options
  const ivaOptions = [13, 4, 2, 1, 0.5, 0];

  // Calculate IVA and total when gross price or IVA rate changes
  useEffect(() => {
    const price = parseFloat(grossPriceText) || 0;
    setGrossPrice(price);

    const iva = (price * ivaRate) / 100;
    setIvaAmount(iva);
  }, [grossPriceText, ivaRate]);

  const formatCurrency = (value: number) => {
    return value.toFixed(2);
  };

  const validateForm = (): boolean => {
    try {
      productSchema.parse({
        name: name.trim(),
        grossPrice,
        ivaRate,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form and try again.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to create product
      const productData = {
        name: name.trim(),
        grossPrice,
        ivaRate,
        ivaAmount
      };

      
      await ProductsService.create(productData);

      Alert.alert(
        'Success',
        'Product has been created successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Name Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Product Name</ThemedText>
            <FormField
              value={name}
              onChangeText={setName}
              placeholder="e.g. Organic Coffee Beans"
              error={errors.name}
              autoCapitalize="words"
              label='Product Name'
            />
          </View>

          {/* Pricing & Tax Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Pricing & Tax</ThemedText>
            
              {/* Gross Price */}
              <View style={styles.priceField}>
                <ThemedText style={styles.fieldLabel}>Gross Price (price with IVA)</ThemedText>
                <View style={styles.currencyInput}>
                  <ThemedText style={styles.currencySymbol}>₡</ThemedText>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    value={grossPriceText}
                    onChangeText={setGrossPriceText}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
                {errors.grossPrice && (
                  <ThemedText style={styles.errorText}>{errors.grossPrice}</ThemedText>
                )}
              </View>

              {/* IVA Rate */}
              <View style={styles.ivaField}>
                <ThemedText style={styles.fieldLabel}>IVA Rate (%)</ThemedText>
                <View style={styles.ivaSelector}>
                  {ivaOptions.map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.ivaOption,
                        ivaRate === rate && styles.ivaOptionSelected,
                        { borderColor: ivaRate === rate ? colors.primary : colors.border }
                      ]}
                      onPress={() => setIvaRate(rate)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[
                        styles.ivaOptionText,
                        ivaRate === rate && { color: colors.primary }
                      ]}>
                        {rate}%
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            {/* IVA Amount */}
            <View style={styles.calculatedField}>
              <ThemedText style={styles.fieldLabel}>IVA Amount</ThemedText>
              <View style={styles.currencyInput}>
                <ThemedText style={styles.currencySymbol}>₡</ThemedText>
                <ThemedText style={styles.calculatedValue}>
                  {formatCurrency(ivaAmount)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Total Price Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Total Price</ThemedText>
              <ThemedText style={styles.totalValue}>
                ₡{formatCurrency(grossPrice)}
              </ThemedText>
            </View>
            <ThemedText style={styles.totalSubtext}>
              Calculated automatically from net price and tax rate
            </ThemedText>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? "Saving Product..." : "Save Product"}
            onPress={handleSubmit}
            disabled={isLoading || !name.trim() || grossPrice <= 0}
            size="large"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  placeholder: {
    width: 32, // Same as back button width for centering
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.light.background,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceField: {
    flex: 1,
  },
  ivaField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  currencySymbol: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginRight: Spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    padding: 0,
  },
  calculatedField: {
    marginBottom: Spacing.lg,
  },
  calculatedValue: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  ivaSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ivaOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  ivaOptionSelected: {
    borderWidth: 2,
    backgroundColor: Colors.light.primaryLight + '10', // 10% opacity
  },
  ivaOptionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  totalSection: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
  },
  totalSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.danger,
    marginTop: Spacing.xs,
  },
});