import { BorderRadius, Spacing, Typography } from '@/constants';
import useClients from '@/hooks/useClients';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClientCard, ThemedText, ThemedView } from './';

export type ClientSelectProps = {
  label?: string;
  placeholder?: string;
  onClientSelect: (client: Client) => void;
  onClientClear?: () => void;
  defaultClientId?: string;
  error?: string;
  required?: boolean;
  style?: any;
};

type ClientListItemProps = {
  item: Client;
  onPress: (client: Client) => void;
  isSelected: boolean;
};

const ClientListItem: React.FC<ClientListItemProps> = ({ item, onPress, isSelected }) => {
    const handlePress = () => {
      onPress(item);
    };
  return (
    <ClientCard
      name={item.name}
      phone={item.phoneNumber}
      onPress={handlePress}
    />
  );
};

export function ClientSelect({
  label = "SELECT CLIENT",
  placeholder = "Choose a client...",
  onClientSelect,
  onClientClear,
  defaultClientId,
  error,
  required = false,
  style,
}: ClientSelectProps) {
  const colors = useThemeColor();
  const { clients, loading } = useClients();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Set default selected client
  useEffect(() => {
    if (defaultClientId && clients.length > 0 && !selectedClient) {
      const defaultClient = clients.find(client => client.id === defaultClientId);
      if (defaultClient) {
        setSelectedClient(defaultClient);
        onClientSelect(defaultClient);
      }
    }
  }, [defaultClientId, clients, selectedClient, onClientSelect]);

  // Filter clients based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.phoneNumber && client.phoneNumber.includes(searchQuery)) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client);
    setIsModalVisible(false);
    setSearchQuery('');
    onClientSelect(client);
  }, [onClientSelect]);

  const handleClearSelection = useCallback(() => {
    setSelectedClient(null);
    setSearchQuery('');
    if (onClientClear) {
      onClientClear();
    }
  }, [onClientClear]);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <ClientListItem
      item={item}
      onPress={handleClientSelect}
      isSelected={selectedClient?.id === item.id}
    />
  );

  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </ThemedText>
          {required && (
            <ThemedText style={[styles.required, { color: colors.danger }]}>
              *
            </ThemedText>
          )}
        </View>
      )}

      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            borderColor: hasError ? colors.danger : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        {selectedClient ? (
          <View style={styles.selectedClientContainer}>
            <View style={[styles.selectedAvatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.selectedAvatarText, { color: colors.textInverse }]}>
                {selectedClient.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.selectedInfo}>
              <Text style={[styles.selectedName, { color: colors.text }]}>
                Client: {selectedClient.name}
              </Text>
              {selectedClient.phoneNumber && (
                <Text style={[styles.selectedContact, { color: colors.textSecondary }]}>
                  Contact: {selectedClient.phoneNumber}
                </Text>
              )}
            </View>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
              {placeholder}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {hasError && (
        <ThemedText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </ThemedText>
      )}

      {/* Client Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.text,
                  fontSize: Typography.fontSize.base,
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search clients..."
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Client List */}
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
            style={styles.clientList}
            contentContainerStyle={styles.clientListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="person-search"
                  size={48}
                  color={colors.textSecondary}
                />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {loading ? 'Loading clients...' : 'No clients found'}
                </ThemedText>
                {searchQuery && (
                  <ThemedText style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    Try adjusting your search terms
                  </ThemedText>
                )}
              </View>
            )}
          />
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    fontSize: Typography.fontSize.sm,
    marginLeft: 2,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectedClientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  selectedAvatarText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  selectedContact: {
    fontSize: Typography.fontSize.xs,
  },
  clearButton: {
    padding: 4,
  },
  placeholderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: Typography.fontSize.base,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        paddingTop: Spacing.xl + 20, // Account for status bar
      },
      android: {
        paddingTop: Spacing.xl,
      },
    }),
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  searchClearButton: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
  clientList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  clientListContent: {
    paddingBottom: Spacing.xl,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  clientAvatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  clientContact: {
    fontSize: Typography.fontSize.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
