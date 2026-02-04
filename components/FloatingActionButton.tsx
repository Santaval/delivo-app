import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

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
};

export function FloatingActionButton({
  onPress,
  icon = 'add',
  iconSize = 24,
  size = 56,
  backgroundColor,
  iconColor,
}: FloatingActionButtonProps) {
  const colors = useThemeColor();

  const DEVICE_WIDTH = Dimensions.get('window').width;
  const DEVICE_HEIGHT = Dimensions.get('window').height;
  console.log(DEVICE_WIDTH, DEVICE_HEIGHT);
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
          top: DEVICE_HEIGHT * 0.8,
          left: DEVICE_WIDTH * 0.8,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
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
