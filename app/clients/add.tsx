import { FormField, LocationSearch, PrimaryButton, ThemedText, ThemedView, TopBar } from '@/components';
import { Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useToast } from '@/context/ToastContext';
import i18n from '@/i18n';
import ClientsService from '@/services/clients/Clients.service';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Add Client Form with Zod validation
const clientSchema = z.object({
  name: z.string().min(1, i18n.t('clientNameIsRequired')).min(2, i18n.t('minTwoCharacters')),
  phoneNumber: z.string().min(1, i18n.t('phoneNumberIsRequired')).min(2, i18n.t('minTwoCharacters')),
  email: z.email(i18n.t('invalidEmail')).optional().nullable(),
  lat: z.number().refine(val => val !== 0, { message: i18n.t('pleaseSelectALocation') }),
  lng: z.number().refine(val => val !== 0, { message: i18n.t('pleaseSelectALocation') }),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function AddClient() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: null,
    phoneNumber: '',
    lat: 0,
    lng: 0,
  });

  const [selectedLocationName, setSelectedLocationName] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ClientFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const result = clientSchema.safeParse(formData);
    if (!result.success) {
      setErrors(prev => {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        return newErrors;
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const client = await ClientsService.createClient(formData);

      router.push(`/clients/profile/${client.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      toast.show({ message: t('failedToCreateClient'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TopBar
          title={t('addNewClient')}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            <ThemedText style={styles.sectionTitle}>{t('contactDetails')}</ThemedText>

            <FormField
              label={t('clientName')}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder={t('enterClientName')}
              error={errors.name}
              required
            />

            <FormField
              label={t('phoneNumber')}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="+506 8715 6553"
              keyboardType='phone-pad'
              error={errors.phoneNumber}
              required
            />

            <FormField
              label={t('email')}
              value={formData.email || ""}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="contact@business.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <LocationSearch
              label={t('location')}
              placeholder={t('searchForALocation')}
              onLocationSelect={(location) => {
                handleInputChange('lat', location.latitude);
                handleInputChange('lng', location.longitude);
                setSelectedLocationName(location.description);
              }}
              onLocationClear={() => {
                handleInputChange('lat', 0);
                handleInputChange('lng', 0);
                setSelectedLocationName('');
              }}
              error={errors.lat || errors.lng}
              required
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={t('cancel')}
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <PrimaryButton
                title={isSubmitting ? t('creatingClient') : t('createClient')}
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={styles.submitButton}
              />
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});