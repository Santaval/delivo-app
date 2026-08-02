import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useColorScheme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function OAuthRedirect() {
  const colors = useThemeColor();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
