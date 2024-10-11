import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { styled } from 'nativewind';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState(new Date());
    const [province, setProvince] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Handle birthdate change from DateTimePicker
    const onChangeBirthdate = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || birthdate;
        setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
        setBirthdate(currentDate);
    };

    return (
        <StyledView className="flex-1 justify-center items-center bg-white">
            {/* Title */}
            <StyledText className="text-xl font-bold text-gray-900">สร้างบัญชี</StyledText>
            <StyledText className="text-base text-gray-400 mt-1">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>

            {/* Username Input */}
            <StyledView className="w-4/5 mt-6">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="ชื่อผู้ใช้ของคุณ"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        ชื่อผู้ใช้
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Gender Picker */}
            
            <StyledView className="w-4/5 mt-6">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="เพศ"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={gender}
                        onChangeText={setGender}
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        เพศ
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Province Picker */}
            
            <StyledView className="w-4/5 mt-6">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="จังหวัด"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={province}
                        onChangeText={setProvince}
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        จังหวัด
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Birthdate Picker */}
            <StyledView className="w-4/5 mt-4">
                <DateTimePicker
                    value={birthdate}
                    mode="date"
                    onChange={onChangeBirthdate}
                    //maximumDate - 18 years
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                    className='px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit'
                />
                <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        วันเกิด
                    </StyledText>
            </StyledView>

            {/* Phone Number Input */}
            <StyledView className="w-4/5 mt-4">
                <StyledView className="relative">
                    <StyledTextInput
                        placeholder="+66"
                        className="px-4 py-3 text-lg outline-none border-2 border-gray-400 rounded-full hover:border-gray-600 duration-200 peer focus:border-indigo-600 bg-inherit"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                    <StyledText className="absolute left-4 text-gray-400 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        เบอร์โทรศัพท์
                    </StyledText>
                </StyledView>
            </StyledView>

            {/* Submit Button */}
            <StyledTouchableOpacity className="bg-blue-600 rounded-full py-3 px-3 mt-6 w-4/5 shadow-sm">
                <StyledText className="text-center text-white text-lg font-semibold">สร้างบัญชี</StyledText>
            </StyledTouchableOpacity>
        </StyledView>
    );
}
