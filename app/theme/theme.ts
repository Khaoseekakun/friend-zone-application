import { ColorSchemeName } from 'react-native';
import { Theme as NavigationTheme } from '@react-navigation/native'; // Import the required type from react-navigation

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
  primary: '#6200EE', // You can customize these values
  text: '#000000',
  border: '#E0E0E0',
  card: '#FFFFFF',
  notification: '#FF80AB',
};

const darkColors: ThemeColors = {
  background: '#000000',
  primary: '#BB86FC', // You can customize these values
  text: '#FFFFFF',
  border: '#303030',
  card: '#121212',
  notification: '#FF4081',
};

// Extend the theme to include the required properties for react-navigation
export const getThemeColors = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkColors : lightColors;
};

// Update the Theme type to include the 'dark' boolean and extend it to React Navigation's theme
export type Theme = NavigationTheme & {
  colors: ThemeColors;
};

// Make sure the theme includes the 'dark' property and colors
export const getTheme = (colorScheme: ColorSchemeName): Theme => ({
  dark: colorScheme === 'dark', // This is required by react-navigation
  colors: getThemeColors(colorScheme),
});
