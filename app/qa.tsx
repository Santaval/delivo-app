import { FormField, PrimaryButton, ThemedText } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useColorScheme, useThemeColor } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BorderRadius, Spacing, Typography } from "../constants";

type LoginData = {
  username: string;
  password: string;
};

export default function QALoginPage() {
  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const { qaLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const colors = useThemeColor();
  const scheme = useColorScheme();

  const handleSubmit = async () => {
    if (!loginData.username.trim() || !loginData.password.trim()) {
      toast.show({
        message: "Username and password are required",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await qaLogin(loginData.username, loginData.password);
      // Clearing the guard in app/_layout.tsx performs the redirect.
    } catch (error) {
      toast.show({ message: "Failed to log in", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.welcome}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <MaterialIcons name="lock" size={32} color={colors.primary} />
            </View>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              QA Login
            </ThemedText>
            <ThemedText
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              This is a QA login page for testing purposes. Please enter your
              credentials to access the application.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <FormField
              label={"username"}
              value={loginData.username}
              onChangeText={(value) =>
                setLoginData({ ...loginData, username: value })
              }
              placeholder={"Enter username"}
              required
              autoCapitalize="none"
            />
            <FormField
              label={"password"}
              value={loginData.password}
              onChangeText={(value) =>
                setLoginData({ ...loginData, password: value })
              }
              placeholder={"Enter password"}
              required
              isSecure
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isLoading ? "Logging In" : "Login"}
            onPress={handleSubmit}
            disabled={
              isLoading ||
              !loginData.username.trim() ||
              !loginData.password.trim()
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  welcome: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
  },
  buttonContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
