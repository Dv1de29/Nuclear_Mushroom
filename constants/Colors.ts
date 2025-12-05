const palette = {
  primary: '#4F46E5',
  secondary: '#10B981',
  error: '#EF4444',

  lightBg: '#FFFFFF',
  lightGray: '#F3F4F6',
  lightText: '#1F2937',
  lightBorder: '#E5E7EB',

  darkBg: '#111827',
  darkCard: '#1F2937',
  darkText: '#F9FAFB',
  darkBorder: '#374151',
};

export default {
  light: {
    text: palette.lightText,
    textSecondary: '#6B7280',
    background: palette.lightBg,
    card: palette.lightGray,
    tint: palette.primary,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: palette.primary,
    border: palette.lightBorder,
    error: palette.error,
  },
  dark: {
    text: palette.darkText,
    textSecondary: '#9CA3AF',
    background: palette.darkBg,
    card: palette.darkCard,
    tint: palette.primary,
    tabIconDefault: '#6B7280',
    tabIconSelected: palette.primary,
    border: palette.darkBorder,
    error: palette.error,
  },
};