import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { styled } from 'nativewind';
import { RootStackParamList } from '../../types';
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use navigation for screen transitions

    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [province, setProvince] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    return (
        <StyledView className="flex-1 justify-center items-center bg-white">
            <StyledText className="text-xl font-bold text-gray-900">สร้างบัญชี</StyledText>
            <StyledText className="text-base text-gray-400 mt-1">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>

            <StyledView className="w-4/5 mt-6">
                <StyledTextInput
                    placeholder="ชื่อผู้ใช้ของคุณ"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={username}
                    onChangeText={setUsername}
                />
            </StyledView>

            <StyledView className="w-4/5 mt-4">
                <StyledTextInput
                    placeholder="เพศของคุณ"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={gender}
                    onChangeText={setGender}
                />
            </StyledView>

            <StyledView className="w-4/5 mt-4">
                <StyledTextInput
                    placeholder="MM/DD/YYYY"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={birthdate}
                    onChangeText={setBirthdate}
                />
            </StyledView>

            <StyledView className="w-4/5 mt-4">
                <StyledTextInput
                    placeholder="เลือกจังหวัดของคุณ"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={province}
                    onChangeText={setProvince}
                />
            </StyledView>

            <StyledView className="w-4/5 mt-4">
                <StyledTextInput
                    placeholder="+66"
                    className="border rounded-full px-4 py-3 mt-1 text-gray-700 bg-gray-100"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
            </StyledView>

            {/* Add navigation on button click */}
            <StyledTouchableOpacity
                className="w-4/5 bg-gradient-to-r from-pink-500 to-orange-400 py-3 mt-8 rounded-full"
                onPress={() => navigation.navigate('HomeScreen')}
            >
                <StyledText className="text-center text-white text-lg font-semibold">ถัดไป</StyledText>
            </StyledTouchableOpacity>
        </StyledView>
    );
}
