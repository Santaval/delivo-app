import AppleSignInButton from "@/components/AppleSignInButton";
import Logo from "@/components/Logo";
import { SocialButton } from "@/components/SocialButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, Typography } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useCompanies } from "@/context/CompaniesContext";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useThemeColor } from "@/hooks/useColorScheme";
import { useGoogleAuth } from "@/hooks/useGoogleAuh";
import { Link, router } from "expo-router";
import { useEffect } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Index() {
  const colors = useThemeColor();
  const { authState } = useAuth();
  const { activeCompany } = useCompanies();
  const { onGoogleSignIn, isLoading  } = useGoogleAuth();
  const { onAppleSignIn } = useAppleAuth();

  const handleGoogleSignIn = async () => {
    await onGoogleSignIn();
  };

  useEffect(() => {
    if (authState.isLoading) return; // Still loading
    if (authState.authenticated && activeCompany) {
      router.replace('/(tabs)/home');
    }
  }, [authState, activeCompany]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Logo />

      </View>

      {/* App Title & Subtitle */}
      <View style={styles.titleSection}>
        <ThemedText variant="caption" style={styles.appSubtitle}>
          Manage your business with ease
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


        {/* <SocialButton
          provider="apple"
          onPress={() => console.log('Apple login pressed')}
        /> */}
      </View>

      {/* Footer Links */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <ThemedText
            variant="link"
            style={styles.footerLink}
            onPress={() => console.log('Terms pressed')}
          >
            Terms of Service
          </ThemedText>
          <ThemedText variant="caption" style={styles.footerSeparator}>
            •
          </ThemedText>
          <ThemedText
            variant="link"
            style={styles.footerLink}
            onPress={() => console.log('Privacy pressed')}
          >
            Privacy Policy
          </ThemedText>
          <ThemedText
            variant="link"
            style={styles.footerLink}
            onPress={() => console.log('Privacy pressed')}
          >
            Privacy Policy
          </ThemedText>
          <Link href={"/(tabs)/home"} >Home</Link>
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
