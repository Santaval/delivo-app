import AppleSignInButton from "@/components/AppleSignInButton";
import Logo from "@/components/Logo";
import { SocialButton } from "@/components/SocialButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, Typography } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useThemeColor } from "@/hooks/useColorScheme";
import { useGoogleAuth } from "@/hooks/useGoogleAuh";
import config from "@/config/env";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const colors = useThemeColor();
  const { authState } = useAuth();
  const { onGoogleSignIn, isLoading  } = useGoogleAuth();
  const { onAppleSignIn } = useAppleAuth();
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    await onGoogleSignIn();
  };

  if (authState.isLoading || authState.authenticated) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Logo />

      </View>

      {/* App Title & Subtitle */}
      <View style={styles.titleSection}>
        <ThemedText variant="caption" style={styles.appSubtitle}>
          {t("manageYourBusinessWithEase")}
        </ThemedText>
      </View>

      {/* Social Login Buttons */}
      <View style={styles.buttonSection}>
        <SocialButton
          provider="google"
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        />

        <AppleSignInButton
          onPress={onAppleSignIn}
        />
      </View>

      {/* Footer Links */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <ThemedText
            variant="link"
            style={styles.footerLink}
            onPress={() => WebBrowser.openBrowserAsync(config.termsUrl)}
            accessibilityRole="link"
          >
            {t("termsOfService")}
          </ThemedText>
          <ThemedText variant="caption" style={styles.footerSeparator}>
            •
          </ThemedText>
          <ThemedText
            variant="link"
            style={styles.footerLink}
            onPress={() => WebBrowser.openBrowserAsync(config.privacyUrl)}
            accessibilityRole="link"
          >
            {t("privacyPolicy")}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['6xl'],
  },
  logoSubtext: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  titleSection: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  buttonSection: {
    flex: 0.4,
    gap: Spacing.md,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.sm,
  },
  footer: {
    flex: 0.1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: Typography.fontSize.sm,
  },
  footerSeparator: {
    marginHorizontal: Spacing.md,
  },
});
