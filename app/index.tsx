import Logo from "@/components/Logo";
import { SocialButton } from "@/components/SocialButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Index() {
  const colors = useThemeColor();

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Logo />
        <ThemedText variant="subtitle" style={styles.logoSubtext}>
          TributoCR
        </ThemedText>
      </View>

      {/* App Title & Subtitle */}
      <View style={styles.titleSection}>
        <ThemedText variant="title" style={styles.appTitle}>
          TributoCR
        </ThemedText>
        <ThemedText variant="caption" style={styles.appSubtitle}>
          Manage your business with ease
        </ThemedText>
      </View>

      {/* Social Login Buttons */}
      <View style={styles.buttonSection}>
        <SocialButton 
          provider="google" 
          onPress={() => console.log('Google login pressed')}
        />
        
        <SocialButton 
          provider="apple" 
          onPress={() => console.log('Apple login pressed')}
        />


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
