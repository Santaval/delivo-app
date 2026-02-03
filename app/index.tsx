import { ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BusinessCard } from "@/components/BusinessCard";
import { Spacing } from "@/constants/Theme";

export default function Index() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText variant="title" style={styles.header}>
          Business Dashboard
        </ThemedText>
        
        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Quick Overview
        </ThemedText>
        
        {/* Sample business cards */}
        <BusinessCard
          title="Monthly Revenue"
          amount={15750.50}
          type="income"
          subtitle="This month"
          onPress={() => console.log('Revenue pressed')}
        />
        
        <BusinessCard
          title="Operating Expenses"
          amount={8432.25}
          type="expense"
          subtitle="This month"
          onPress={() => console.log('Expenses pressed')}
        />
        
        <BusinessCard
          title="Route Optimization Savings"
          amount={1250.00}
          type="income"
          subtitle="Fuel & time saved"
          onPress={() => console.log('Route savings pressed')}
        />
        
        <ThemedText variant="caption" style={styles.footer}>
          Theme: Primary color #0f49bd | Ready for dark mode
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing['6xl'], // Account for status bar
  },
  header: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing['4xl'],
  },
});
