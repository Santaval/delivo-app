# Theme Strategy for Business Expenses & Income App

## Overview
This document outlines the theme strategy for a small business expenses and income tracking app with route optimization features. The theme is built with **light mode as primary** and **dark mode ready** for easy future implementation.

## Primary Color
- **Primary Color**: `#0f49bd` (Deep Blue)
- **Primary Light**: `#3d6dd4` (For hover states, lighter accents)
- **Primary Dark**: `#0a3596` (For pressed states, darker accents)

## Theme Architecture

### 1. Color System (`/constants/Colors.ts`)
- **Semantic Colors**: Success (income), Danger (expense), Warning, Info
- **Business-specific Colors**: Income (`#10b981`), Expense (`#ef4444`), Route optimization (`#8b5cf6`)
- **Surface Colors**: Background, Surface, Secondary backgrounds
- **Text Colors**: Primary, Secondary, Tertiary text with proper contrast
- **Border Colors**: Subtle borders for cards and dividers

### 2. Typography System (`/constants/Theme.ts`)
- **Font Sizes**: From 12px (xs) to 48px (5xl)
- **Font Weights**: Normal, Medium, Semibold, Bold
- **Line Heights**: Tight, Normal, Relaxed
- **System Fonts**: Uses device system fonts for better performance

### 3. Spacing System
- **4px Base Unit**: All spacing follows 4px increments
- **Range**: 4px (xs) to 96px (8xl)
- **Consistent Spacing**: Ensures visual rhythm throughout the app

### 4. Component System

#### ThemedText Component
```typescript
// Usage examples:
<ThemedText variant="title">Dashboard</ThemedText>
<ThemedText variant="success">+$1,250 Income</ThemedText>
<ThemedText variant="danger">-$432 Expense</ThemedText>
```

#### ThemedView Component
```typescript
// Usage examples:
<ThemedView variant="surface">Card Content</ThemedView>
<ThemedView variant="primary">Primary Background</ThemedView>
```

#### BusinessCard Component
```typescript
// Business-specific card for financial data
<BusinessCard
  title="Monthly Revenue"
  amount={15750.50}
  type="income"
  subtitle="This month"
  onPress={() => handleCardPress()}
/>
```

## Business App Color Semantics

### Financial Colors
- **Income/Profit**: `#10b981` (Green) - Positive financial impact
- **Expenses/Loss**: `#ef4444` (Red) - Negative financial impact
- **Route Optimization**: `#8b5cf6` (Purple) - Technology/efficiency features
- **Neutral**: `#6b7280` (Gray) - Informational data

### State Colors
- **Success**: `#10b981` - Successful operations, completed tasks
- **Warning**: `#f59e0b` - Alerts, pending items, attention needed
- **Danger**: `#ef4444` - Errors, overbudget, critical issues
- **Info**: `#3b82f6` - General information, tips, help

## Dark Mode Strategy (Ready for Implementation)

### Current Implementation
- Light mode is **forced** in `useColorScheme` hook
- Dark mode colors are **pre-defined** in Colors.ts
- Easy toggle: Change one line in `useColorScheme.ts`

### To Enable Dark Mode Later
```typescript
// In hooks/useColorScheme.ts - Change this line:
const colorScheme = 'light';
// To this:
const colorScheme = useNativeColorScheme();
```

### Dark Mode Considerations
- **Contrast**: All text maintains proper contrast ratios
- **Surface Elevation**: Cards and surfaces use appropriate depth
- **Color Accessibility**: Colors meet WCAG guidelines in both modes

## File Structure
```
/constants/
  ├── Colors.ts          # Color definitions and ColorScheme type
  ├── Theme.ts           # Typography, spacing, shadows, borders
  └── index.ts           # Barrel exports

/hooks/
  ├── useColorScheme.ts  # Theme hook with light/dark toggle
  └── index.ts           # Barrel exports

/components/
  ├── ThemedText.tsx     # Themed text component
  ├── ThemedView.tsx     # Themed view component
  ├── BusinessCard.tsx   # Business-specific card component
  └── index.ts           # Barrel exports
```

## Usage Examples

### Dashboard Screen
```typescript
import { ThemedView, ThemedText, BusinessCard } from '@/components';

export function Dashboard() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="title">Business Dashboard</ThemedText>
      
      <BusinessCard
        title="Monthly Revenue"
        amount={15750.50}
        type="income"
        subtitle="This month"
      />
      
      <BusinessCard
        title="Operating Expenses"
        amount={8432.25}
        type="expense"
        subtitle="This month"
      />
    </ThemedView>
  );
}
```

### Custom Component with Theme
```typescript
import { useThemeColor } from '@/hooks';
import { Spacing, BorderRadius } from '@/constants';

export function CustomButton() {
  const colors = useThemeColor();
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
      }}
    >
      <Text style={{ color: colors.textInverse }}>
        Add Expense
      </Text>
    </TouchableOpacity>
  );
}
```

## Benefits of This Strategy

1. **Consistency**: Unified color and spacing system across the app
2. **Scalability**: Easy to add new colors and components
3. **Maintainability**: Centralized theme management
4. **Future-Proof**: Dark mode ready with one-line change
5. **Type Safety**: Full TypeScript support with proper typing
6. **Business Context**: Colors and components tailored for financial apps
7. **Accessibility**: Proper contrast ratios and semantic color usage

## Next Steps for Implementation

1. **Add Business Logic**: Integrate with expense/income data
2. **Create More Components**: Charts, forms, navigation components
3. **Implement Dark Mode**: When ready, enable system theme detection
4. **Add Animations**: Smooth transitions between theme changes
5. **Test Accessibility**: Ensure proper contrast and screen reader support
