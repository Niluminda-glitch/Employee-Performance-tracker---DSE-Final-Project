// Theme configuration for the mobile app
// Based on the web app's theme

export const colors = {
  // Base colors
  background: '#f8f9ff', // Slightly bluer background for better contrast
  foreground: '#0f172a',

  // Card colors
  card: '#ffffff',
  cardForeground: '#0f172a',

  // Primary colors
  primary: '#7c3aed', // Slightly darker purple for better contrast
  primaryForeground: '#ffffff',

  // Secondary colors
  secondary: '#f1f5f9',
  secondaryForeground: '#7c3aed',

  // Muted colors
  muted: '#f1f5f9',
  mutedForeground: '#64748b',

  // Accent colors
  accent: '#f0f4ff', // Slightly bluer accent
  accentForeground: '#7c3aed',

  // Destructive colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  // Border
  border: '#e2e8f0',

  // Input
  input: '#e2e8f0',

  // Ring
  ring: '#7c3aed',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  danger: '#ef4444',

  // Additional colors for gradients
  gradient1: '#7c3aed',
  gradient2: '#4f46e5',
  gradient3: '#3b82f6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};

// Card styles
export const cardStyles = {
  default: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg, // Increased padding
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)', // Subtle border
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg, // Stronger shadow for gradient cards
  },
  elevated: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
};

// Button styles
export const buttonStyles = {
  default: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 2, // Android shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5, // Slightly thicker border
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 1,
  },
  success: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 2,
  },
  danger: {
    backgroundColor: colors.destructive,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    elevation: 2,
  },
};

export default {
  colors,
  spacing,
  fontSizes,
  fontWeights,
  borderRadius,
  shadows,
  cardStyles,
  buttonStyles,
};
