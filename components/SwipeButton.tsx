import { BorderRadius, Spacing, Typography } from '@/constants';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export type SwipeButtonProps = {
  onSwipeComplete: () => void;
  text: string;
  isLoading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  thumbColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: any;
};

export default function SwipeButton({
  onSwipeComplete,
  text,
  isLoading = false,
  disabled = false,
  backgroundColor = Colors.light.primary,
  textColor = Colors.light.textInverse,
  thumbColor = Colors.light.background,
  iconName = 'chevron-forward',
  style
}: SwipeButtonProps) {
  const { t } = useTranslation();
  const translateX = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth - (Spacing.lg * 2);
  const thumbWidth = 48;
  const maxSlide = buttonWidth - thumbWidth - 8; // 8px for padding
  const threshold = maxSlide * 0.8; // 80% threshold

  const onPanGestureEvent = (event: any) => {
    if (disabled || isLoading) return;
    
    const { translationX } = event.nativeEvent;
    const clampedTranslationX = Math.max(0, Math.min(translationX, maxSlide));
    translateX.setValue(clampedTranslationX);
    
    // Scale effect as user slides
    const scale = 1 + (clampedTranslationX / maxSlide) * 0.05;
    buttonScale.setValue(scale);
  };

  const onPanHandlerStateChange = (event: any) => {
    if (disabled || isLoading) return;
    
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.END || state === State.CANCELLED) {
      if (translationX >= threshold) {
        // Success! Complete the slide and trigger action
        Animated.timing(translateX, {
          toValue: maxSlide,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          onSwipeComplete();
          // Reset after a delay
          setTimeout(() => {
            resetSwipeButton();
          }, 500);
        });
      } else {
        // Reset to original position
        resetSwipeButton();
      }
    }
  };

  const resetSwipeButton = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint={t('swipeToConfirmHint')}
      accessibilityState={{ disabled, busy: isLoading }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate' && !disabled && !isLoading) {
          onSwipeComplete();
        }
      }}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor,
            transform: [{ scale: buttonScale }]
          }
        ]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          {text}
        </Text>
        
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          enabled={!disabled && !isLoading}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: thumbColor,
                transform: [{ translateX }]
              }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.text} />
            ) : (
              <Ionicons 
                name={iconName} 
                size={24} 
                color={disabled ? Colors.light.textTertiary : Colors.light.text} 
              />
            )}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
