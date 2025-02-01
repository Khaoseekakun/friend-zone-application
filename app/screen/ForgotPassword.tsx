import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, useColorScheme, Appearance } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { API_SYSTEM_KEY } from '@/components/config';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ForgotPassword() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otpEnter, setOtpEnter] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const [theme, setTheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, []);

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


    const handleSendOtpVerification = async () => {
        if (!email) {
            Alert.alert('กรุณากรอกอีเมลของคุณ', 'กรุณากรอกอีเมลของคุณก่อนที่จะส่งรหัส OTP', [
                {
                    text: 'ตกลง'
                }
            ]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('https://friendszone.app/api/email/otp',
                {
                    email: email
                }, {
                headers: {
                    'Authorization': `System ${API_SYSTEM_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
            )

            if (response.data.status === 200) {
                setStep(2);
            } else {
                if (response.data.data.code == "EMAIL_WAIT") {
                    const timeLeft = response.data.data.timeLeft;
                    return Alert.alert(`เกิดข้อผิดพลาด`, `กรุณารอ ${timeLeft} วินาที ก่อนที่จะส่งรหัส OTP อีกครั้ง`, [
                        {
                            text: 'ตกลง'
                        }
                    ]);
                }

                return Alert.alert(`เกิดข้อผิดพลาด`, 'ไม่สามารถส่งรหัส OTP ไปยังอีเมลของคุณได้', [
                    {
                        text: 'ลองอีกครั้ง'
                    }
                ]);

            }

        } catch (error) {
            console.log(error)
            Alert.alert(`เกิดข้อผิดพลาด`, 'ไม่สามารถส่งรหัส OTP ไปยังอีเมลของคุณได้', [
                {
                    text: 'ลองอีกครั้ง'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendResetPassword = async () => {
        try {

            //check password

            if (password !== confirmPassword) {
                return Alert.alert('รหัสผ่านไม่ตรงกัน', 'รหัสผ่านที่คุณป้อนไม่ตรงกัน กรุณาลองใหม่อีกครั้ง')
            }

            if (password?.length < 6) {
                return Alert.alert('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านของคุณต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
            }


            setLoading(true);
            const response = await axios.put('https://friendszone.app/api/oauth/password', {
                email: email,
                password: password
            }, {
                headers: {
                    'Authorization': `System ${API_SYSTEM_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.status == 200) {
                return Alert.alert('เปลี่ยนรหัสผ่านสำเร็จ', 'รหัสผ่านของคุณได้ถูกเปลี่ยนแล้ว', [
                    {
                        text: 'กลับไปหน้าเข้าสู่ระบบ',
                        onPress: () => navigation.navigate('Login', {})
                    }
                ])
            }

            Alert.alert('เปลี่ยนรหัสผ่านไม่สำเร็จ', 'ไม่สามารถเปลี่ยนรหัสผ่านของคุณได้')
        } catch (error) {
            console.log(error)
            Alert.alert('เปลี่ยนรหัสผ่านไม่สำเร็จ', 'ไม่สามารถเปลี่ยนรหัสผ่านของคุณได้')
        }
    }

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
                onPress={() => handleSendOtpVerification()}
                disabled={loading}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <LinearGradient
                        colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
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

    const handleVerifyOTP = async () => {
        try {
            setLoading(true);
            if (otpEnter?.length < 6) {
                return Alert.alert('รหัส OTP ไม่ถูกต้อง', 'กรุณากรอกรหัส OTP ที่ถูกต้อง')
            }

            if (isNaN(Number(otpEnter))) {
                return Alert.alert('รหัส OTP ไม่ถูกต้อง', 'กรุณากรอกรหัส OTP ที่ถูกต้อง')
            }

            const response = await axios.put('https://friendszone.app/api/email/otp', {
                email: email,
                otp: otpEnter
            }, {
                headers: {
                    'Authorization': `System ${API_SYSTEM_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.status === 200) {
                setStep(3);
            } else {
                if (response.data.data.code == "OTP_EXPIRED") {
                    return Alert.alert('รหัส OTP หมดอายุ', 'รหัส OTP ที่คุณกรอกหมดอายุแล้ว โปรดส่งคำขอใหม่อีกครั้ง')
                }
                return Alert.alert('รหัส OTP ไม่ถูกต้อง', 'รหัส OTP ที่คุณกรอกไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
            }
        } catch (error) {
            console.log(error)
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถยืนยันรหัส OTP ของคุณได้')
        } finally {
            setLoading(false);
        }
    }

    const renderOtpStep = () => (
        <StyledView className="flex-1 px-6 justify-center items-center -top-10">
            <TouchableOpacity
                onPress={() => setStep(1)}
                className="absolute top-10 left-6"
            >
                <Ionicons name="arrow-back" size={32} color={theme === 'dark' ? '#fff' : '#000'} />
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
                    value={`${otpEnter}`}
                    onChangeText={setOtpEnter}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </StyledView>

            <TouchableOpacity
                className="w-full duration-200 mb-4"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleVerifyOTP}
                disabled={loading}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <LinearGradient
                        colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
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
                <Ionicons name="arrow-back" size={32} color={theme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>

            <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] pt-2">ตั้งรหัสผ่านใหม่</StyledText>
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
                        size={32}
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
                onPress={() => handleSendResetPassword()}
                disabled={loading}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <LinearGradient
                        colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
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
            <StyledSafeAreaView className="flex-1 bg-white dark:bg-black pt-14">
                {step === 1 && renderEmailStep()}
                {step === 2 && renderOtpStep()}
                {step === 3 && renderNewPasswordStep()}
            </StyledSafeAreaView>
        </KeyboardAvoidingView>
    );
}

