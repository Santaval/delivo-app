import { FormField, PrimaryButton, ThemedText, ThemedView, TopBar } from '@/components';
import { Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Add Client Form with Zod validation
const clientSchema = z.object({
  name: z.string().min(1, 'Business name is required').min(2, 'Business name must be at least 2 characters'),
  phoneNumber: z.string().min(1, 'Contact name is required').min(2, 'Contact name must be at least 2 characters'),
  email: z.string().optional(),
  lat: z.string().min(-90, 'Latitude is required').max(90, 'Latitude must be between -90 and 90'),
  lng: z.string().min(-180, 'Longitude is required').max(180, 'Longitude must be between -180 and 180'),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function AddClient() {
  const router = useRouter();

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    lat: '',
    lng: '',
  });

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock client creation
      console.log('Creating client:', formData);

      Alert.alert(
        'Success',
        'Client has been added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create client. Please try again.');
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
          title="Add New Client"
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            <ThemedText style={styles.sectionTitle}>Contact details</ThemedText>

            <FormField
              label="Client name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter client name"
              error={errors.name}
              required
            />

            <FormField
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="+506 8715 6553"
              keyboardType='phone-pad'
              error={errors.phoneNumber}
              required
            />

            <FormField
              label="Email"
              value={formData.email || ""}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="contact@business.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

           

            <FormField
              label="Latitude"
              value={formData.lat.toString()}
              onChangeText={(value) => handleInputChange('lat', value)}
              placeholder="-12.345678"
              keyboardType="numeric"
              error={errors.lat}
              required
            />

            <FormField
              label="Longitude"
              value={formData.lng.toString()}
              onChangeText={(value) => handleInputChange('lng', value)}
              placeholder="-12.345678"
              keyboardType="numeric"
              error={errors.lng}
              required
            />



            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <PrimaryButton
                title={isSubmitting ? "Creating..." : "Create Client"}
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