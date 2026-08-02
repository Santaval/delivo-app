import { BorderRadius, Shadows, Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';

export type ToastType = 'success' | 'error' | 'info';

export type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextType = {
  show: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType>({ show: () => {} });

/**
 * Module-level handle so non-component code (axios interceptors, services)
 * can trigger toasts. Set by ToastProvider on mount.
 */
let globalShow: ((options: ToastOptions) => void) | null = null;

export const toast = {
  success: (message: string) => globalShow?.({ message, type: 'success' }),
  error: (message: string) => globalShow?.({ message, type: 'error' }),
  info: (message: string) => globalShow?.({ message, type: 'info' }),
};

const ICONS: Record<ToastType, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  error: 'error-outline',
  info: 'info-outline',
};

const HIDDEN_OFFSET = -120;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastOptions | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useSharedValue(HIDDEN_OFFSET);

  const hide = useCallback(() => {
    translateY.value = withTiming(HIDDEN_OFFSET, { duration: 200 });
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    // Unmount after the slide-out finishes
    setTimeout(() => setCurrent(null), 250);
  }, [translateY]);

  const show = useCallback(
    (options: ToastOptions) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setCurrent(options);
      translateY.value = withTiming(0, { duration: 250 });
      AccessibilityInfo.announceForAccessibility(options.message);
      hideTimer.current = setTimeout(hide, options.duration ?? 3000);
    },
    [hide, translateY],
  );

  useEffect(() => {
    globalShow = show;
    return () => {
      globalShow = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const typeColor =
    current?.type === 'success'
      ? colors.success
      : current?.type === 'error'
        ? colors.danger
        : colors.info;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {current ? (
        <Animated.View
          style={[
            styles.toast,
            { top: insets.top + Spacing.sm, backgroundColor: colors.surface },
            animatedStyle,
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.toastContent}
            onPress={hide}
            activeOpacity={0.9}
            accessibilityRole="alert"
            accessibilityLabel={current.message}
          >
            <MaterialIcons name={ICONS[current.type ?? 'info']} size={22} color={typeColor} />
            <ThemedText style={styles.message} numberOfLines={3}>
              {current.message}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.lg,
    zIndex: 1000,
    ...Shadows.medium,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  message: {
    flex: 1,
  },
});
