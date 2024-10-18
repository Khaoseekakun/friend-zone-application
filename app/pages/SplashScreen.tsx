// src/pages/SplashScreen.tsx
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Image, StyleSheet, Animated, useColorScheme, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getThemeColors } from '../theme/theme';

const Icon = require('../../assets/images/logo.png');
const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Agreement: { nextScreen: 'Login' };
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Agreement', { nextScreen: 'Login' });
    });
  }, [fadeAnim, navigation]);

  useEffect(() => {
    const timer = setTimeout(fadeOut, 2000);
    return () => clearTimeout(timer);
  }, [fadeOut]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
        translucent
      />
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.background,
            opacity: fadeAnim,
          }
        ]}
      >
        <Image
          source={Icon}
          style={[styles.logo, { tintColor: themeColors.text }]}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default SplashScreen;