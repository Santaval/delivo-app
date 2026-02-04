import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';

export type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
  autoFocus?: boolean;
  onClear?: () => void;
  showClearButton?: boolean;
};

export function SearchBar({
  placeholder = 'Search by name or number...',
  onSearch,
  debounceMs = 300,
  initialValue = '',
  autoFocus = false,
  onClear,
  showClearButton = true,
}: SearchBarProps) {
  const colors = useThemeColor();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, debounceMs);

    // Cleanup timeout on component unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, onSearch, debounceMs]);

  const handleClear = () => {
    setSearchQuery('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <ThemedView style={[
      styles.container,
      {
        borderColor: isFocused ? colors.primary : colors.border,
        backgroundColor: colors.surface,
      }
    ]}>
      {/* Search Icon */}
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={isFocused ? colors.primary : colors.textSecondary} 
        />
      </View>

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: colors.text,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* Clear Button */}
      {showClearButton && searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="close" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    paddingVertical: Spacing.xs,
    // Remove default TextInput styling
    margin: 0,
    padding: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
