import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { styled } from 'nativewind';
import { RootStackParamList } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'react-native';

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
        setShowDatePicker(false); // Hide picker after selection
        setBirthdate(currentDate);
    };

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black">
                    <StyledText className="text-xl font-bold text-gray-900 dark:text-white">สร้างบัญชี</StyledText>
                    <StyledText className="text-base text-gray-400 dark:text-gray-300 mt-1">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>

                    {/* Username */}
                    <StyledView className="w-4/5 mt-6">
                        <StyledView className="relative">
                            <StyledTextInput
                                placeholder="ชื่อผู้ใช้ของคุณ"
                                placeholderTextColor="#cccccc"
                                className="px-4 py-3 text-lg outline-none border-2 border-gray-400 dark:border-gray-300 rounded-full hover:border-gray-600 dark:hover:border-gray-500 duration-200 peer focus:border-indigo-600 dark:focus:border-indigo-400 bg-inherit text-black dark:text-white"
                                value={username}
                                onChangeText={setUsername}
                            />
                            <StyledText className="absolute left-4 text-gray-400 dark:text-gray-300 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                                ชื่อผู้ใช้
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Gender */}
                    <StyledView className="w-4/5 mt-6">
                        <StyledView className="relative">
                            <StyledTextInput
                                placeholder="เพศ"
                                placeholderTextColor="#cccccc"
                                className="px-4 py-3 text-lg outline-none border-2 border-gray-400 dark:border-gray-300 rounded-full hover:border-gray-600 dark:hover:border-gray-500 duration-200 peer focus:border-indigo-600 dark:focus:border-indigo-400 bg-inherit text-black dark:text-white"
                                value={gender}
                                onChangeText={setGender}
                            />
                            <StyledText className="absolute left-4 text-gray-400 dark:text-gray-300 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                                เพศ
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Province */}
                    <StyledView className="w-4/5 mt-6">
                        <StyledView className="relative">
                            <StyledTextInput
                                placeholder="จังหวัด"
                                placeholderTextColor="#cccccc"
                                className="px-4 py-3 text-lg outline-none border-2 border-gray-400 dark:border-gray-300 rounded-full hover:border-gray-600 dark:hover:border-gray-500 duration-200 peer focus:border-indigo-600 dark:focus:border-indigo-400 bg-inherit text-black dark:text-white"
                                value={province}
                                onChangeText={setProvince}
                            />
                            <StyledText className="absolute left-4 text-gray-400 dark:text-gray-300 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                                จังหวัด
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Birthdate */}
                    <StyledView className="w-4/5 mt-4">
                        <StyledView className="relative">
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="px-4 py-3 text-lg outline-none border-2 border-gray-400 dark:border-gray-300 rounded-full hover:border-gray-600 dark:hover:border-gray-500 duration-200 peer focus:border-indigo-600 dark:focus:border-indigo-400 bg-inherit"
                            >
                                <StyledText className="text-black dark:text-white">
                                    {`วันเกิด: ${birthdate.toLocaleDateString()}`}
                                </StyledText>
                            </TouchableOpacity>
                            <StyledText className="absolute left-4 text-gray-400 dark:text-gray-300 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                                วันเกิด
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Phone Number */}
                    <StyledView className="w-4/5 mt-4">
                        <StyledView className="relative">
                            <StyledTextInput
                                placeholder="+66"
                                placeholderTextColor="#cccccc"
                                className="px-4 py-3 text-lg outline-none border-2 border-gray-400 dark:border-gray-300 rounded-full hover:border-gray-600 dark:hover:border-gray-500 duration-200 peer focus:border-indigo-600 dark:focus:border-indigo-400 bg-inherit text-black dark:text-white"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                            <StyledText className="absolute left-4 text-gray-400 dark:text-gray-300 -top-2 px-1 text-sm uppercase tracking-wide peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 pointer-events-none duration-200 peer-focus:text-sm peer-focus:-translate-y-5 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                                เบอร์โทรศัพท์
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledTouchableOpacity className="bg-gradient-to-r from-teal-400 to-blue-500 rounded-full py-3 px-3 mt-6 w-4/5 shadow-sm">
                        <StyledText className="text-center text-white text-lg font-semibold">สร้างบัญชี</StyledText>
                    </StyledTouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={birthdate}
                            mode="date"
                            display="calendar"
                            onChange={onChangeBirthdate}
                        />
                    )}


                </StyledView>
            </KeyboardAvoidingView>
        </>
    );
}
