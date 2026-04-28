import { Platform } from 'react-native';

export const Theme = {
  colors: {
    primary: '#7B61FF',
    secondary: '#9BA3AF',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    success: '#10B981',
    error: '#EF4444',
    border: '#334155',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
    // Compatibility keys for existing Glass components
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    textPrimary: '#FFFFFF',
    buttonGradient: ['#7B61FF', '#6366F1'],
    buttonAccent: '#7B61FF',
    inputBackground: 'rgba(255,255,255,0.05)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 999,
  },
  glassCard: {
    borderRadius: 24,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
};

export const GlobalTheme = Theme;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
