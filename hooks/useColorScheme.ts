import { Colors, type ColorScheme } from '@/constants/Colors';
import { useColorScheme as useSystemColorScheme } from 'react-native';

/**
 * Hook to get the current color scheme, following the device setting
 * (`app.json` declares `userInterfaceStyle: "automatic"`).
 */
export function useColorScheme(): ColorScheme {
  const colorScheme = useSystemColorScheme();

  // Anything other than an explicit 'dark' (null, undefined, 'unspecified')
  // falls back to the light palette.
  return colorScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Hook to get theme colors based on current color scheme.
 * This is the only supported way to read colors in the UI — reaching into
 * `Colors.light` / `Colors.dark` directly is what breaks dark mode, and is
 * blocked by an ESLint rule outside of the theme system itself.
 */
export function useThemeColor() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}
