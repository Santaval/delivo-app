import { BorderRadius, Spacing, Typography } from '@/constants';
import { toast } from '@/context/ToastContext';
import { useThemeColor } from '@/hooks/useColorScheme';
import useGeolsocation from '@/hooks/useGeolocation';
import PlacesService from '@/services/geolocation/places.service';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';

export type LocationSearchProps = {
  label?: string;
  placeholder?: string;
  onLocationSelect: (location: PlaceDetails) => void;
  onLocationClear?: () => void;
  initialValue?: string;
  error?: string;
  required?: boolean;
  style?: any;
};

type ListItemProps = {
  item: LocationResponse;
  onPress: (location: LocationResponse) => void;
  isLast: boolean;
};

const LocationListItem: React.FC<ListItemProps> = ({ item, onPress, isLast }) => {
  const colors = useThemeColor();
  
  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        { borderBottomColor: colors.border },
        isLast && styles.listItemLast,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.6}
      delayPressIn={0}
    >
      <MaterialIcons
        name="location-on"
        size={20}
        color={colors.textSecondary}
        style={styles.locationIcon}
      />
      <Text style={[styles.locationText, { color: colors.text }]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};

export function LocationSearch({
  label,
  placeholder = "Search for a location...",
  onLocationSelect,
  onLocationClear,
  initialValue = "",
  error,
  required = false,
  style,
}: LocationSearchProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { locations, autocomplete, clearLocations, isLoading } = useGeolsocation();
  
  const [inputValue, setInputValue] = useState(initialValue || "");
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      autocomplete(query);
    }, 300);
  }, [autocomplete]);

  const handleInputChange = useCallback((text: string) => {
    const safeText = text || "";
    setInputValue(safeText);
    setSelectedLocation(null);
    
    if (safeText.trim()) {
      setShowSuggestions(true);
      debouncedSearch(safeText);
    } else {
      setShowSuggestions(false);
      clearLocations();
    }
  }, [debouncedSearch, clearLocations]);

  const handleLocationSelect = useCallback(async (location: LocationResponse) => {
    try {
      setShowSuggestions(false);
      setIsFocused(false);
      clearLocations();
      
      // Fetch place details to get coordinates
      const placeDetails = await PlacesService.getPlaceDetails(location.placeId);
      
      setInputValue(placeDetails.description);
      setSelectedLocation(placeDetails);
      onLocationSelect(placeDetails);
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast.error(t('failedToGetLocationDetails'));
    }
  }, [onLocationSelect, clearLocations]);

  const handleClearSelection = useCallback(() => {
    setInputValue("");
    setSelectedLocation(null);
    setShowSuggestions(false);
    clearLocations();
    if (onLocationClear) {
      onLocationClear();
    }
  }, [clearLocations, onLocationClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (inputValue && inputValue.length > 0 && !selectedLocation) {
      setShowSuggestions(true);
    }
  }, [inputValue, selectedLocation]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Don't hide suggestions immediately, let the location selection handle it
  }, []);

  const hasError = !!error;
  const showClearButton = inputValue && inputValue.length > 0;
  const showDropdown = showSuggestions && (locations.length > 0 || isLoading);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {label}
          </ThemedText>
          {required && (
            <ThemedText style={[styles.required, { color: colors.danger }]}>
              *
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: hasError ? colors.danger : isFocused ? colors.primary : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: Typography.fontSize.base,
              },
            ]}
            value={inputValue || ""}
            onChangeText={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loadingIcon}
            />
          )}

          {showClearButton && !isLoading && (
            <TouchableOpacity
              onPress={handleClearSelection}
              style={styles.clearButton}
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

        {showDropdown && (
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                ...Platform.select({
                  ios: {
                    shadowColor: colors.text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              },
            ]}
          >
            {isLoading && locations.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Searching locations...
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={true}
              >
                {locations.map((item, index) => (
                  <LocationListItem
                    key={item.placeId}
                    item={item}
                    onPress={handleLocationSelect}
                    isLast={index === locations.length - 1}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {hasError && (
        <ThemedText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </ThemedText>
      )}

      {selectedLocation && (
        <View
          style={[
            styles.selectedLocationContainer,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary,
            },
          ]}
        >
          <MaterialIcons
            name="location-on"
            size={16}
            color={colors.textInverse}
            style={styles.selectedLocationIcon}
          />
          <ThemedText style={[styles.selectedLocationText, { color: colors.textInverse }]}>
            Selected: {selectedLocation.latitude}, {selectedLocation.longitude}
          </ThemedText>
        </View>
      )}
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
    fontWeight: Typography.fontWeight.medium,
  },
  required: {
    fontSize: Typography.fontSize.sm,
    marginLeft: 2,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  loadingIcon: {
    marginLeft: Spacing.xs,
  },
  clearButton: {
    marginLeft: Spacing.xs,
    padding: 2,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginTop: 2,
    maxHeight: 200,
    zIndex: 1000,
  },
  list: {
    flexGrow: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  locationIcon: {
    marginRight: Spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  selectedLocationIcon: {
    marginRight: Spacing.xs,
  },
  selectedLocationText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
});
