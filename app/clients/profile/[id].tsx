import {
  PrimaryButton,
  ThemedText,
  ThemedView,
  TopBar
} from '@/components';
import { BorderRadius, Shadows, Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useColorScheme';
import ClientsService from '@/services/clients/Clients.service';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';




type InfoItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | null | undefined;
  onPress?: () => void;
  isLink?: boolean;
};



export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = async () => {
    try {
      setError(null);
      const clientData = await ClientsService.getClientById(id);
      setClient(clientData);
      
      if (!clientData) {
        setError('Client not found');
      }
    } catch (err) {
      setError('Failed to load client information');
      console.error('Error fetching client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClient();
    setRefreshing(false);
  };

  const handleCall = () => {
    if (client?.phoneNumber) {
      Linking.openURL(`tel:${client.phoneNumber}`).catch(err => {
        console.error('Error making call:', err);
        Alert.alert('Error', 'Could not open phone application');
      });
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  if (loading) {
    return (<Text>Loading...</Text>);
  }

  if (error || !client) {
    return (
      <ThemedView style={styles.container}>
        <TopBar 
          title="Client Profile" 
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={48} color={colors.danger} />
          <ThemedText style={[styles.errorText, { color: colors.danger }]}>
            {error || 'Client not found'}
          </ThemedText>
          <PrimaryButton
            title="Try Again"
            onPress={fetchClient}
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        title="Client Profile" 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ThemedView style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.profileContent}>
            {/* Large centered avatar */}
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.profileAvatarText}>
                {client.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            
            {/* Client name */}
            <ThemedText style={[styles.profileName, { color: colors.text }]}>
              {client.name}
            </ThemedText>
            
            {/* Phone number with country flag concept */}
            {client.phoneNumber && (
              <View style={styles.phoneContainer}>
                <ThemedText style={[styles.phoneNumber, { color: colors.textSecondary }]}>
                  {client.phoneNumber}
                </ThemedText>
              </View>
            )}
            
            {/* Action buttons */}
            <View style={styles.actionButtonsRow}>
              {client.phoneNumber && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={handleCall}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="phone" size={20} color={colors.textInverse} />
                  <ThemedText style={[styles.actionButtonText, { color: colors.textInverse }]}>
                    Call
                  </ThemedText>
                </TouchableOpacity>
              )}
              
              {client.phoneNumber && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={() => {
                    const phoneNumber = client.phoneNumber?.replace(/[^\d]/g, '');
                    const whatsappUrl = `https://wa.me/${phoneNumber}`;
                    Linking.openURL(whatsappUrl).catch(err => {
                      console.error('Error opening WhatsApp:', err);
                      Alert.alert('Error', 'Could not open WhatsApp');
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="chat" size={20} color="#25D366" />
                  <ThemedText style={[styles.actionButtonText, { color: '#25D366' }]}>
                    WhatsApp
                  </ThemedText>
                </TouchableOpacity>
              )}
              
            </View>
          </View>
        </ThemedView>

  
      </ScrollView>
m    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  profileHeader: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  profileAvatarText: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textInverse,
  },
  profileName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  phoneNumber: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minWidth: 100,
    justifyContent: 'center',
    ...Shadows.small,
  },
  whatsappButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#25D366',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
  },
});
