/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0f49bd';
const tintColorDark = '#4a90e2'; // Lighter variant for dark mode

export type ColorScheme = 'light' | 'dark';

export const Colors = {
  light: {
    // Primary colors
    primary: '#0f49bd',
    primaryLight: '#3d6dd4',
    primaryDark: '#0a3596',
    
    // Secondary colors for business app
    success: '#10b981', // Green for income/profit
    warning: '#f59e0b', // Orange for alerts/warnings  
    danger: '#ef4444',  // Red for expenses/losses
    info: '#3b82f6',    // Blue for information
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#f1f5f9',
    
    // Surface colors
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    
    // Text colors
    text: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#e2e8f0',
    borderSecondary: '#cbd5e1',
    
    // Shadow
    shadow: '#000000',
    
    // Tab/Navigation colors
    tint: tintColorLight,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Business-specific colors
    income: '#10b981',
    expense: '#ef4444',
    route: '#8b5cf6', // Purple for route optimization
    neutral: '#6b7280',
  },
  dark: {
    // Primary colors (prepared for dark mode)
    primary: '#4a90e2',
    primaryLight: '#6ba3e8',
    primaryDark: '#2d5aa0',
    
    // Secondary colors
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    
    // Background colors
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    
    // Surface colors
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    
    // Text colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',
    
    // Border colors
    border: '#374151',
    borderSecondary: '#4b5563',
    
    // Shadow
    shadow: '#000000',
    
    // Tab/Navigation colors
    tint: tintColorDark,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    
    // Business-specific colors
    income: '#34d399',
    expense: '#f87171',
    route: '#a78bfa',
    neutral: '#9ca3af',
  },
};
