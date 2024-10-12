import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, Text, StatusBar} from 'react-native';
import { styled } from 'nativewind';
import Icon from '../assets/images/logo.png';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function SplashScreenView() {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <>
        <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black">
            <StatusBar barStyle={'default'} backgroundColor={'#000s'}/>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image source={Icon} className="w-24 h-24 shadow-lg" />
                <StyledText className="text-xl font-bold mt-4 text-black dark:text-white">Friend Zone</StyledText>
            </Animated.View>
        </StyledView>
        </>
    );
}
