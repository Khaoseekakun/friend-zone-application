import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { API_SYSTEM_KEY } from '@/components/config';
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function Login() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [pageLoading, setPageLoading] = useState(true);
    const [deviceId, setDeviceId] = useState('');

    const getDeviceId = async () => {
        return await AsyncStorage.getItem('uuid') as string;
    };


    useFocusEffect(() => {
        AsyncStorage.getItem('userToken').then(token => {
            if (token) {
                navigation.navigate('HomeScreen', {});
            } else {
                setPageLoading(false);
            }
        });

        (async () => {
            setDeviceId(await getDeviceId());
        })();
    })

    if (pageLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#EB3834" />
            </View>
        );
    }


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const loginHandler = async () => {
        setLoading(true);
        try {
            const loginData = await axios.post('https://friendszone.app/api/oauth/login', {
                phoneNumber: phone,
                password: password,
                deviceId: deviceId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `System ${API_SYSTEM_KEY}`
                }
            });

            if (loginData.data.data.code !== "LOGIN_SUCCESS") {
                if (loginData.data.data.code === "ALREADY_LOGGED_IN") {
                    return Alert.alert("ไม่สำเร็จ", "บัญชีนี้กำลังเข้าสู่ระบบในเครื่องอื่นโปรดออกจากระบบก่อน", [{ text: "ลองอีกครั้ง" }]);
                } else {
                    return Alert.alert("ไม่สำเร็จ", "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง", [{ text: "ลองอีกครั้ง" }]);
                }


            }

            if (loginData.data.data.data.status === 'pending') {
                return Alert.alert("ไม่สำเร็จ", "บัญชีนี้ยังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ", [{ text: "ลองอีกครั้ง" }]);
            }

            const token = loginData?.data?.data.data.token;


            if (token) {
                try {
                    await AsyncStorage.setItem('userData', JSON.stringify(loginData.data.data.data));
                    await AsyncStorage.setItem('userToken', token);
                    const resetAction = StackActions.replace("HomeScreen")

                    navigation.dispatch(resetAction);
                } catch (error) {
                    console.error('Failed to store the token:', error);
                    return Alert.alert("ไม่สำเร็จ", "เกิดข้อผิดพลาดไม่สามารถบันทึกข้อมูลเพื่อนเข้าสู่ระบบได้", [{ text: "ลองอีกครั้ง" }]);
                }
            } else {
                return Alert.alert("ไม่สำเร็จ", "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง", [{ text: "ลองอีกครั้ง" }]);
            }
        } catch (error) {
            console.log(error);
            return Alert.alert("ไม่สำเร็จ", "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง", [{ text: "ลองอีกครั้ง" }]);
        } finally {
            setLoading(false);
        }
    };

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-white dark:bg-black">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className="flex-1 px-6 justify-center items-center">
                    <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">Friend Zone</StyledText>
                    <StyledText className="text-lg text-gray-400 mb-8 font-custom">ยินดีต้อนรับกลับ</StyledText>

                    <StyledView className="w-full mb-7">
                        <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">เบอร์โทรศัพท์</StyledText>
                        <StyledTextInput
                            placeholder="ป้อนเบอร์โทรศัพท์"
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full"
                            value={phone}
                            onChangeText={setPhone}
                            placeholderTextColor="#9CA3AF"
                            textContentType='telephoneNumber'
                            inputMode='tel'
                            enterKeyHint='done'
                        />
                    </StyledView>
                    <StyledView className="w-full mb-3">
                        <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">รหัสผ่าน</StyledText>
                        <StyledTextInput
                            placeholder="ป้อนรหัสผ่านของคุณ"
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full pr-12"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 flex-1 items-center justify-center h-full"
                        >
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={32}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </StyledView>

                    {/* Create Account */}
                    <StyledView className="flex-row justify-between w-full mb-1 ">
                        <StyledTouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword', {
                                backPage: 'Login'
                            })}
                        >
                            <StyledText className="font-custom text-blue-600 text-[17px]">ลืมรหัสผ่าน?</StyledText>
                        </StyledTouchableOpacity>
                        <StyledView className="flex-row items-center">
                            <StyledText className='font-custom text-gray-500 text-[17px]'>ยังไม่มีบัญชี</StyledText>
                            <StyledTouchableOpacity onPress={() => navigation.navigate('Agreement', { nextScreen: 'Register' })}>
                                <StyledText className='font-custom text-blue-600 text-[17px]'>สร้างบัญชี</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>
                    </StyledView>

                    <StyledView className="flex-row justify-between w-full mb-10">
                        <StyledView className="flex-row items-center">
                            <StyledTouchableOpacity onPress={() => navigation.navigate('Policy', { backPage: 'Login' })}>
                                <StyledText className='font-custom text-blue-500 text-[17px]'>ข้อกำหนด</StyledText>
                            </StyledTouchableOpacity>
                            <StyledText className='font-custom text-gray-500 text-[17px]'>และ</StyledText>
                            <StyledTouchableOpacity onPress={() => navigation.navigate('Privacy', { backPage: 'Login' })}>
                                <StyledText className='font-custom text-blue-500 text-[17px]'>ข้อตกลง</StyledText>
                            </StyledTouchableOpacity>
                            <StyledText className='font-custom text-gray-500 text-[17px]'>ของเรา</StyledText>
                        </StyledView>
                    </StyledView>

                    <TouchableOpacity
                        className="w-full duration-200"
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={loginHandler}
                        disabled={loading}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <LinearGradient
                                colors={colorScheme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-3 shadow-sm"
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <StyledText className="font-custom text-center text-white text-lg font-semibold">เข้าสู่ระบบ</StyledText>
                                )}
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </StyledView>
            </KeyboardAvoidingView >
        </StyledSafeAreaView>
    );
}