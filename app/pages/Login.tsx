import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
export default function Login() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use navigation for screen transitions
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <StyledView className="flex-1 justify-center items-center bg-white">
            <StyledText className="text-2xl font-bold text-gray-900">Friend Zone</StyledText>
            <StyledText className="text-base text-gray-400 mt-1">ยินดีต้อนรับกลับ</StyledText>

            {/* Email Input */}
            <StyledView className="w-4/5 mt-6">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="อีเมลของคุณ"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        อีเมล
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Password Input */}
            <StyledView className="w-4/5 mt-6">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="รหัสผ่าน"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        รหัสผ่าน
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Forgot Password and Create Account */}
            <StyledView className="flex-row justify-between w-4/5 mt-2">
                <StyledTouchableOpacity>
                    <StyledText className="text-blue-500 text-sm">ลืมรหัสผ่าน ?</StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <StyledText className="text-gray-500 text-sm">ยังไม่มีบัญชี? สร้างบัญชี</StyledText>
                </StyledTouchableOpacity>
            </StyledView>

            {/* Login Button */}
            <StyledTouchableOpacity className="w-4/5 bg-gradient-to-r from-pink-500 to-orange-400 py-3 mt-8 rounded-full">
                <StyledText className="text-center text-white text-lg font-semibold">เข้าสู่ระบบ</StyledText>
            </StyledTouchableOpacity>
        </StyledView>
    );
}
