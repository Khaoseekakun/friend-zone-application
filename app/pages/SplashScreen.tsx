// src/pages/SplashScreen.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, Animated, useColorScheme, StatusBar, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

const Icon = require('../../assets/images/logo.png'); // Make sure this path is correct

type RootStackParamList = {
  Login: undefined;
  Agreement: { nextScreen: 'Login' };
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity is 1
  const colorScheme = useColorScheme(); // Check the current color scheme (dark or light)
  
  const fadeOut = useCallback(() => {
    // Animating opacity to 0 over 1 second
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Login');
    });
  }, [fadeAnim, navigation]);

  useEffect(() => {
    // Set a timer to trigger fadeOut after 2 seconds
    const timer = setTimeout(fadeOut, 2000);
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [fadeOut]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image source={Icon} style={styles.logo} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Consider making this dynamic based on the theme
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
