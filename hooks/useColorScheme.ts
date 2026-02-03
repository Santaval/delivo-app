import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors, type ColorScheme } from '@/constants/Colors';

/**
 * Hook to get the current color scheme and theme colors
 * For now returns 'light' by default, but ready for dark mode implementation
 */
export function useColorScheme(): ColorScheme {
  // For now, force light mode. Later, uncomment the line below for system theme detection
  // const colorScheme = useNativeColorScheme();
  
  // Force light mode for now
  const colorScheme = 'light';
  
  return colorScheme ?? 'light';
}

/**
 * Hook to get theme colors based on current color scheme
 */
export function useThemeColor() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme as keyof typeof Colors];
}
