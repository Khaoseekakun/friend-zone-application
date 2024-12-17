import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ForgotPassword() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;

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

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const renderEmailStep = () => (
        <StyledView className="flex-1 px-6 justify-center items-center -top-10">
            <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">ลืมรหัสผ่าน</StyledText>
            <StyledText className="text-lg text-gray-400 mb-8 font-custom text-center">กรุณากรอกอีเมลที่ลงทะเบียนไว้{'\n'}เพื่อรับรหัส OTP</StyledText>

            <StyledView className="w-full mb-7">
                <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">อีเมล</StyledText>
                <StyledTextInput
                    placeholder="กรอกอีเมลของคุณ"
                    className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </StyledView>

            <TouchableOpacity
                className="w-full duration-200 mb-4"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => setStep(2)}
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
                            <StyledText className="font-custom text-center text-white text-lg font-semibold">
                                รับรหัส OTP
                            </StyledText>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mt-4"
            >
                <StyledText className="font-custom text-gray-500">กลับไปหน้าเข้าสู่ระบบ</StyledText>
            </TouchableOpacity>
        </StyledView>
    );

    const renderOtpStep = () => (
        <StyledView className="flex-1 px-6 justify-center items-center -top-10">
            <TouchableOpacity
                onPress={() => setStep(1)}
                className="absolute top-10 left-6"
            >
                <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>

            <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">ยืนยันรหัส OTP</StyledText>
            <StyledText className="text-lg text-gray-400 mb-8 font-custom text-center">
                กรุณากรอกรหัส OTP ที่ส่งไปยัง{'\n'}{email}
            </StyledText>

            <StyledView className="w-full mb-7">
                <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">รหัส OTP</StyledText>
                <StyledTextInput
                    placeholder="กรอกรหัส OTP"
                    className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full"
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </StyledView>

            <TouchableOpacity
                className="w-full duration-200 mb-4"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => setStep(3)}
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
                            <StyledText className="font-custom text-center text-white text-lg font-semibold">
                                ยืนยันรหัส OTP
                            </StyledText>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEmail('')}>
                <StyledText className="font-custom text-blue-600">แก้ไขอีเมล</StyledText>
            </TouchableOpacity>
        </StyledView>
    );

    const renderNewPasswordStep = () => (
        <StyledView className="flex-1 px-6 justify-center items-center -top-10">
            <TouchableOpacity
                onPress={() => setStep(2)}
                className="absolute top-10 left-6"
            >
                <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>

            <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">ตั้งรหัสผ่านใหม่</StyledText>
            <StyledText className="text-lg text-gray-400 mb-8 font-custom">กรุณาตั้งรหัสผ่านใหม่ของคุณ</StyledText>

            <StyledView className="w-full mb-7">
                <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">รหัสผ่านใหม่</StyledText>
                <StyledTextInput
                    placeholder="ป้อนรหัสผ่านใหม่"
                    className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full pr-12"
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

            <StyledView className="w-full mb-7">
                <StyledText className="font-custom text-sm text-gray-600 mb-2 ml-4 absolute -top-2 px-1 bg-white dark:bg-black dark:text-white z-50 left-2">ยืนยันรหัสผ่านใหม่</StyledText>
                <StyledTextInput
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full pr-12"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isPasswordVisible}
                    placeholderTextColor="#9CA3AF"
                />
            </StyledView>

            <TouchableOpacity
                className="w-full duration-200"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => navigation.navigate('Login', {})}
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
                            <StyledText className="font-custom text-center text-white text-lg font-semibold">
                                เปลี่ยนรหัสผ่าน
                            </StyledText>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        </StyledView>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledSafeAreaView className="flex-1 bg-white dark:bg-black">
                {step === 1 && renderEmailStep()}
                {step === 2 && renderOtpStep()}
                {step === 3 && renderNewPasswordStep()}
            </StyledSafeAreaView>
        </KeyboardAvoidingView>
    );
}