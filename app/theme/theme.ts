// src/theme/theme.ts
import { ColorSchemeName } from 'react-native';

type ThemeColors = {
  background: string;
};

const lightColors: ThemeColors = {
  background: '#FFFFFF'
};

const darkColors: ThemeColors = {
  background: '#000000'
};

export const getThemeColors = (colorScheme: ColorSchemeName): ThemeColors => {
  return colorScheme === 'dark' ? darkColors : lightColors;
};

export type Theme = {
  colors: ThemeColors;
};

export const getTheme = (colorScheme: ColorSchemeName): Theme => ({
  colors: getThemeColors(colorScheme),
});