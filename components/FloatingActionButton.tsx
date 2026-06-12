import { Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type FloatingActionButtonProps = {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconSize?: number;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  bottom?: number;
  right?: number;
  left?: number;
  accessibilityLabel?: string;
};

export function FloatingActionButton({
  onPress,
  icon = 'add',
  iconSize = 24,
  size = 56,
  backgroundColor,
  iconColor,
  bottom,
  right,
  left,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor || colors.primary,
          position: 'absolute',
          bottom: bottom ?? 100,
          ...(left !== undefined ? { left } : { right: right ?? Spacing.xl }),
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('add')}
    >
      <View style={styles.content}>
        <MaterialIcons
          name={icon}
          size={iconSize}
          color={iconColor || colors.textInverse}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
