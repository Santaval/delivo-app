import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/hooks/useColorScheme";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "./ThemedText";

export type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  required?: boolean;
  isSecure?: boolean;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  required = false,
  isSecure = false,
}: FormFieldProps) {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {required && (
          <ThemedText style={[styles.required, { color: colors.danger }]}>
            *
          </ThemedText>
        )}
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
          },
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        accessibilityLabel={label}
        accessibilityHint={error}
        secureTextEntry={isSecure}
      />

      {/* Error Message */}
      {error && (
        <ThemedText style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  required: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 48,
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
