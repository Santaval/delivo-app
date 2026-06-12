import { Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';

const CHECK_URL = 'https://1.1.1.1/cdn-cgi/trace';
const POLL_MS = 5000;
const TIMEOUT_MS = 4000;

async function checkOnline(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(CHECK_URL, { method: 'HEAD', cache: 'no-store', signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function useConnectivity(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  const refresh = useCallback(async () => {
    setIsOnline(await checkOnline());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [refresh]);

  return isOnline;
}

export function useIsOnline(): boolean {
  return useConnectivity();
}

export function OfflineBanner() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isOnline = useConnectivity();

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.banner,
        { top: insets.top, backgroundColor: colors.warning },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <MaterialIcons name="cloud-off" size={16} color={colors.text} />
      <ThemedText variant="caption" style={[styles.text, { color: colors.text }]}>
        {t('offlineMessage')}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    zIndex: 999,
  },
  text: {
    fontWeight: '600',
  },
});
