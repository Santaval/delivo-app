import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import RoutesService from '@/services/routes/Routes.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Zod validation schema
const routeSchema = z.object({
  name: z.string().min(1, 'Route name is required').max(50, 'Route name too long'),
});


export default function CreateRoute() {
  const colors = useThemeColor();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState('');

  // Set default route name on component mount
  useEffect(() => {
    const defaultName = `${t('route')} ${moment().format('MM/DD')}`;
    setName(defaultName);
  }, []);

  const validateForm = (): boolean => {
    try {
      routeSchema.parse({
        name: name.trim(),
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
      const routeData = {
        name: name.trim(),
      };

      
      const route = await RoutesService.create(routeData);

      router.replace(`/routes/view/${route.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestedName = () => {
    const suggestions = [
      `${t('route')} ${moment().format('MM/DD')}`,
      `${t('route')} ${moment().format('dddd')} `,
      `${t('route')} ${moment().format('MMM DD')}`,
      `${t('delivery')} ${moment().format('MM/DD')}`,
    ];
    
    const currentIndex = suggestions.findIndex(s => s === name);
    const nextIndex = (currentIndex + 1) % suggestions.length;
    setName(suggestions[nextIndex]);
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
        <ThemedText style={styles.headerTitle}>Create Route</ThemedText>
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
          {/* Route Name Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Route Details</ThemedText>
            
            <View style={styles.nameFieldContainer}>
              <FormField
                label="Route Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter route name"
                error={errors.name}
                autoCapitalize="words"
                required
              />
              
              <TouchableOpacity
                style={styles.suggestButton}
                onPress={generateSuggestedName}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="refresh" 
                  size={16} 
                  color={colors.primary} 
                />
                <ThemedText style={[styles.suggestText, { color: colors.primary }]}>
                  Suggest
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons 
                name="info" 
                size={16} 
                color={colors.info || Colors.light.info} 
                style={styles.infoIcon}
              />
              <ThemedText style={styles.infoText}>
                {t('routeCreationTip')}
              </ThemedText>
            </View>
          </View>

          {/* Route Preview */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('routePreview')}</ThemedText>

            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <ThemedText style={[styles.previewRouteName, { color: colors.primary }]}>
                  #{name}
                </ThemedText>
                <View style={styles.statusBadge}>
                  <ThemedText style={styles.statusText}>{t('created')}</ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.previewDate}>
                {moment().format('dddd • MMM DD, YYYY')}
              </ThemedText>
              
              <View style={styles.previewStats}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>0</ThemedText>
                  <ThemedText style={styles.statLabel}>Stops</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statValue}>-</ThemedText>
                  <ThemedText style={styles.statLabel}>ETA</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? t('creatingRoute') : t('createRoute')}
            onPress={handleSubmit}
            disabled={isLoading || !name.trim()}
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
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  nameFieldContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'absolute',
    right: 0,
    top: -6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  suggestText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.info,
  },
  infoIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewRouteName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    backgroundColor: Colors.light.textTertiary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  previewStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});