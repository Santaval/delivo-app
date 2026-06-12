import { ErrorState } from '@/components/feedback/ErrorState';
import Map from '@/components/maps/Map';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants';
import { useToast } from '@/context/ToastContext';
import useUserLocation from '@/hooks/useUserLocation';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface ClientLocationViewProps {
  client: Client;
  onUpdateLocation?: (location: LocationCords) => void;
}

export default function ClientLocationView({ client, onUpdateLocation }: ClientLocationViewProps) {
  const { location, permissionDenied, openSettings } = useUserLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();
  const toast = useToast();

  const clientLocation = {
    lat: client.location.lat || 37.7749,
    lng: client.location.lng || -122.4194,
  };

  const handleUpdateToCurrentLocation = async () => {
    if (!location) {
      toast.show({ message: t('unableToAccessLocation'), type: 'error' });
      return;
    }

    setIsUpdating(true);
    try {
      const newLocation: LocationCords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      
      // Call the update callback if provided
      if (onUpdateLocation) {
        await onUpdateLocation(newLocation);
      }

      toast.show({ message: t('clientLocationUpdated'), type: 'success' });
    } catch (error) {
      console.error('Error updating location:', error);
      toast.show({ message: t('failedToUpdateLocation'), type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Registered Address Section */}
      <View style={styles.section}>
        
        {/* <View style={styles.addressCard}>
          <View style={styles.addressIconContainer}>
            <Ionicons name="location" size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressText}>
              123 Business Way, Suite 400
            </Text>
            <Text style={styles.addressSubtext}>
              San Francisco, CA 94107
            </Text>
          </View>
        </View> */}
      </View>

      {/* Set Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('setLocation')}</Text>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <Map
            markers={[
              {
                coordinate: {
                  latitude: clientLocation.lat,
                  longitude: clientLocation.lng,
                },
                title: client.name,
                description: 'Client location',
                backgroundColor: Colors.light.primary,
              },
            ]}
          />
        </View>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          {t('useCurrentToSetClientLocation')}
        </Text>

        {permissionDenied ? (
          <>
            <ErrorState compact message={t('locationDeniedMessage')} />
            <PrimaryButton
              title={t('openSettings')}
              variant="outline"
              onPress={openSettings}
              style={styles.updateButton}
            />
          </>
        ) : (
          <PrimaryButton
            title={isUpdating ? t('updating') : t('updateToCurrentLocation')}
            onPress={handleUpdateToCurrentLocation}
            disabled={!location || isUpdating}
            style={styles.updateButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  addressSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  mapContainer: {
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  updateButton: {
    marginTop: Spacing.sm,
  },
});
