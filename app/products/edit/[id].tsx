import { LoadingState } from '@/components/feedback/LoadingState';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, ProductsEditParams, Spacing, Typography } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useProduct from '@/hooks/useProduct';
import i18n from '@/i18n';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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

const productSchema = z.object({
  name: z.string().min(1, i18n.t('productNameRequired')).max(100, i18n.t('nameTooLong')),
  grossPrice: z.number().min(0.01, i18n.t('priceMustBeGreaterThanZero')),
  ivaRate: z.number().min(0).max(100),
});

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<ProductsEditParams>();
  const colors = useThemeColor();
  const { t } = useTranslation();
  const toast = useToast();
  const { product, loading, error, update } = useProduct(id);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const [name, setName] = useState('');
  const [grossPriceText, setGrossPriceText] = useState('0.00');
  const [ivaRate, setIvaRate] = useState(13);

  const [grossPrice, setGrossPrice] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);

  const ivaOptions = [13, 4, 2, 1, 0.5, 0];

  useEffect(() => {
    if (product && !isInitialized) {
      setName(product.name);
      setGrossPriceText(product.pricing.totalPrice.toFixed(2));
      setIvaRate(product.pricing.ivaRate);
      setIsInitialized(true);
    }
  }, [product, isInitialized]);

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
      toast.show({ message: t('pleaseCheckTheFormAndTryAgain'), type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: name.trim(),
        grossPrice,
        ivaRate,
        ivaAmount,
      };

      await update(productData);

      toast.show({ message: t('productUpdatedSuccessfully'), type: 'success' });
      router.back();
    } catch {
      toast.show({ message: t('failedToUpdateProduct'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading && !isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t("editProduct")}</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingState message={t('loading')} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t("editProduct")}</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || t('productNotFound')}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t("editProduct")}</ThemedText>
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
          <View style={styles.section}>
            <FormField
              value={name}
              onChangeText={setName}
              placeholder={t("e.g.OrganicCoffeeBeans")}
              error={errors.name}
              autoCapitalize="words"
              label={t("productName")}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t("pricingAndTax")}</ThemedText>

            <View style={styles.priceField}>
              <ThemedText style={styles.fieldLabel}>{t("grossPrice")} ({t("priceWithIva")})</ThemedText>
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

            <View style={styles.ivaField}>
              <ThemedText style={styles.fieldLabel}>{t("ivaRate")} (%)</ThemedText>
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

            <View style={styles.calculatedField}>
              <ThemedText style={styles.fieldLabel}>{t("ivaAmount")}</ThemedText>
              <View style={styles.currencyInput}>
                <ThemedText style={styles.currencySymbol}>₡</ThemedText>
                <ThemedText style={styles.calculatedValue}>
                  {formatCurrency(ivaAmount)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>{t("totalPrice")}</ThemedText>
              <ThemedText style={styles.totalValue}>
                ₡{formatCurrency(grossPrice)}
              </ThemedText>
            </View>
            <ThemedText style={styles.totalSubtext}>
              {t("calculatedAutomaticallyFromNetPriceAndTaxRate")}
            </ThemedText>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? t("savingProduct") : t("saveProduct")}
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
    width: 32,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.md,
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
    backgroundColor: Colors.light.primaryLight + '10',
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
});
