import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const API_SYSTEM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiTG9naW4iLCJzeXN0ZW0iOmZhbHNlLCJwZXJtaXNzaW9ucyI6eyJMb2dpbiI6dHJ1ZX19.K2u_ZzJF_uekLqbmAiuMWZgmisGepYjATVrF-Ks8OX0';

export default function Login() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [pageLoading, setPageLoading] = useState(true);


    useFocusEffect(() => {
        AsyncStorage.getItem('userToken').then(token => {
            if (token) {
                navigation.navigate('HomeScreen');
            } else {
                setPageLoading(false);
            }
        });
    })

    if(pageLoading) {
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
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Login ${API_SYSTEM_KEY}`
                }
            });

            if (loginData.data.data.code !== "LOGIN_SUCCESS") {
                return Alert.alert("ไม่สำเร็จ", "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง", [{ text: "ลองอีกครั้ง" }]);
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledSafeAreaView className="flex-1 bg-white dark:bg-black">
                <StyledView className="flex-1 px-6 justify-center items-center -top-10">
                    <StyledText className="text-3xl font-bold font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">Friend Zone</StyledText>
                    <StyledText className="text-lg text-gray-400 mb-8">ยินดีต้อนรับกลับ</StyledText>

                    <StyledView className="w-full mb-7">
                        <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">เบอร์โทรศัพท์</StyledText>
                        <StyledTextInput
                            placeholder="ป้อนเบอร์โทรศัพท์"
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-700 w-full"
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
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-700 w-full pr-12"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 flex-1 mt-4"
                        >
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </StyledView>

                    {/* Create Account */}
                    <StyledView className="flex-row justify-between w-full mb-10">
                        <StyledTouchableOpacity>
                            <StyledText className="font-custom text-blue-600">ลืมรหัสผ่าน?</StyledText>
                        </StyledTouchableOpacity>
                        <StyledView className="flex-row items-center">
                            <StyledText className='font-custom text-gray-500'>ยังไม่มีบัญชี</StyledText>
                            <StyledTouchableOpacity onPress={() => navigation.navigate('Agreement', { nextScreen: 'Register' })}>
                                <StyledText className='font-custom text-blue-600'>สร้างบัญชี</StyledText>
                            </StyledTouchableOpacity>
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
                                colors={['#EB3834', '#69140F']}
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
            </StyledSafeAreaView>
        </KeyboardAvoidingView>
    );
}