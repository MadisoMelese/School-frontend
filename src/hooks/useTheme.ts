import { useUIStore } from '@store/uiStore';

/**
 * useTheme Hook
 * Provides access to theme state and actions
 */
export const useTheme = () => {
  const { theme, setTheme } = useUIStore();

  return {
    theme,
    setTheme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  };
};

export default useTheme;
