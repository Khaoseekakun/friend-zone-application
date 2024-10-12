import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function Login() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-white">
            <StyledView className="flex-1 px-6 justify-center items-center">
                <StyledText className="text-3xl font-bold text-[#1e3a8a] mb-2">Friend Zone</StyledText>
                <StyledText className="text-lg text-gray-400 mb-20">ยินดีต้อนรับกลับ</StyledText>

                <StyledView className="w-full mb-7">
                    <StyledText className="text-sm text-gray-600 mb-2 ml-4 absolute -mt-3 bg-white z-50">อีเมล</StyledText>
                    <StyledView className="relative">
                        <StyledTextInput
                            placeholder="ป้อนอีเมลของคุณ"
                            className="border border-gray-300 rounded-full py-4 px-4 text-gray-700 w-full"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#9CA3AF"
                        />
                    </StyledView>
                </StyledView>

                <StyledView className="w-full mb-9">
                    <StyledText className="text-sm text-gray-600 mb-2 ml-4 absolute -mt-3 bg-white z-50">รหัสผ่าน</StyledText>
                    <StyledView className="relative">
                        <StyledTextInput
                            placeholder="ป้อนรหัสผ่านของคุณ"
                            className="border border-gray-300 rounded-full py-4 px-4 text-gray-700 w-full pr-12"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 top-3"
                        >
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>

                <StyledView className="flex-row justify-between w-full mb-20">
                    <StyledTouchableOpacity>
                        <StyledText className="text-blue-600">ลืมรหัสผ่าน?</StyledText>
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <StyledText className="text-gray-500">ยังไม่มีบัญชี? <StyledText className="text-blue-600">สร้างบัญชี</StyledText></StyledText>
                    </StyledTouchableOpacity>
                </StyledView>

                <TouchableOpacity className="w-full">
                    <LinearGradient
                        colors={['#ec4899', '#f97316']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        className="rounded-full py-3 shadow-sm"
                    >
                        <StyledText className="text-center text-white text-lg font-semibold">เข้าสู่ระบบ</StyledText>
                    </LinearGradient>
                </TouchableOpacity>
            </StyledView>
        </StyledSafeAreaView>
    );
}