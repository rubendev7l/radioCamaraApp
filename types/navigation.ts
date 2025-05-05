import { theme } from '../constants/theme';

declare global {
  namespace ReactNavigation {
    interface Theme {
      dark: boolean;
      colors: typeof theme.dark;
    }
  }
} 