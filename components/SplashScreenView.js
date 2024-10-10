import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Icon from '../assets/images/logo.png';

export default function SplashScreenView() {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity set to 0

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, // Final opacity value
            duration: 2000, // Duration of the fade-in effect in milliseconds
            useNativeDriver: true, // Enable native driver for better performance
        }).start();
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Animated.Image source={Icon} style={styles.image} />
                <Animated.Text style={{ fontSize: 24, fontWeight: 'bold' }}>Friend Zone</Animated.Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
    },
});
