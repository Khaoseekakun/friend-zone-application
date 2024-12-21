import React, { useEffect, useRef, useCallback } from 'react';
import { Image, StyleSheet, Animated, useColorScheme, StatusBar, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

const Icon = require('../../assets/images/logo.png');

type RootStackParamList = {
  Login: undefined;
  Agreement: { nextScreen: 'Login' };
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000)
    })
  }, [fadeAnim, navigation]);

  useEffect(() => {
    const timer = setTimeout(fadeOut, 3000);
    return () => {
      clearTimeout(timer);
    }
  }, [fadeOut]);

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
    },
  });

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



export default SplashScreen;
