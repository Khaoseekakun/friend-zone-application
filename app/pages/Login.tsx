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
            <StyledView className="w-4/5 mt-8">
                <StyledText className="text-gray-700">อีเมล</StyledText>
                <StyledTextInput
                    placeholder="ป้อนอีเมลของคุณ"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
            </StyledView>

            {/* Password Input */}
            <StyledView className="w-4/5 mt-4">
                <StyledText className="text-gray-700">รหัสผ่าน</StyledText>
                <StyledTextInput
                    placeholder="ป้อนรหัสผ่านของคุณ"
                    secureTextEntry={true}
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
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
