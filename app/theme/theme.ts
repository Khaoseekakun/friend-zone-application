import { ColorSchemeName } from 'react-native';
import { Theme as NavigationTheme } from '@react-navigation/native';
type ThemeColors = {
  background: string;
  primary: string;
  text: string;
  border: string;
  card: string;
  notification: string;
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  primary: '#6200EE', 
  text: '#000000',
  border: '#E0E0E0',
  card: '#FFFFFF',
  notification: '#FF80AB',
};

const darkColors: ThemeColors = {
  background: '#000000',
  primary: '#BB86FC',
  text: '#FFFFFF',
  border: '#303030',
  card: '#121212',
  notification: '#FF4081',
};

export const getThemeColors = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkColors : lightColors;
};

export type Theme = NavigationTheme & {
  colors: ThemeColors;
  fonts: any; 
};
