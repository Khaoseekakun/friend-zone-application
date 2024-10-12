import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TopWaveLogin from '@/components/svg/wave/TopWaveLogin';


const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function Login() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const focuscolor = ['#235eff', '#8023ff', '#ff2323'];
    const [phoneFocus, setPhoneFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="absolute left-0 w-full z-10">
                <TopWaveLogin />
            </StyledView>

            <StyledView className="flex-auto justify-center items-center duration-500 bg-white dark:bg-black h-full">
                <StyledText className="text-2xl font-bold text-gray-900 dark:text-white duration-500">Friend Zone</StyledText>
                <StyledText className="text-base text-gray-800 dark:text-white mt-1 mb-5 duration-500">ยินดีต้อนรับกลับ</StyledText>

                <StyledView className="relative w-4/5 mt-6">
                    <LinearGradient
                        colors={phoneFocus ? focuscolor : ['#ff2323', '#8023ff', '#235eff']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ padding: 2, borderRadius: 50 }}
                    >
                        <StyledView className="bg-white dark:bg-black rounded-full">
                            <StyledTextInput
                                placeholder="0987654321"
                                className="px-6 py-3 text-lg outline-none rounded-full bg-inherit text-black dark:text-white items-center duration-500"
                                value={phone}
                                onChangeText={setPhone}
                                textContentType='telephoneNumber'
                                inputMode='tel'
                                onFocus={() => setPhoneFocus(true)}
                                onBlur={() => setPhoneFocus(false)}
                            />
                        </StyledView>

                    </LinearGradient>
                    <StyledText className="absolute left-4 text-gray-800 dark:text-white -top-2 px-1 text-sm uppercase tracking-wide duration-200 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        เบอร์โทรศัพท์
                    </StyledText>
                </StyledView>

                <StyledView className="w-4/5 mt-6">
                    {/* LinearGradient component for the border */}
                    <LinearGradient
                        colors={passwordFocus ? focuscolor : ['#ff2323', '#8023ff', '#235eff']}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{ padding: 2, borderRadius: 50 }}   // Border radius and padding for the input
                    >
                        {/* Inner View with background and input field */}
                        <StyledView className="relative bg-white dark:bg-black rounded-full">
                            <StyledTextInput
                                placeholder="รหัสผ่าน"
                                className="px-6 py-3 text-lg outline-none rounded-full bg-inherit text-black dark:text-white items-center"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible} // Toggle visibility based on state
                                onFocus={() => setPasswordFocus(true)}
                                onBlur={() => setPasswordFocus(false)}
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                className='absolute right-4 top-3'
                            >
                                <Ionicons
                                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                    size={24}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </StyledView>
                    </LinearGradient>

                    <StyledText className="absolute left-4 text-gray-800 dark:text-white -top-2 px-1 text-sm uppercase tracking-wide duration-200 bg-white dark:bg-black ml-2 peer-valid:text-sm peer-valid:-translate-y-5">
                        รหัสผ่าน
                    </StyledText>
                </StyledView>

                <StyledView className="flex-row justify-between w-4/6 mt-2">
                    <StyledTouchableOpacity className='flex-row'>
                        <StyledText className="text-black text-sm underline">ลืมรหัสผ่าน</StyledText><StyledText className="text-black text-sm"> ?</StyledText>
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <StyledText className="text-gray-500 text-sm">ยังไม่มีบัญชี? <StyledText className='text-black'>สร้างบัญชี</StyledText></StyledText>
                    </StyledTouchableOpacity>
                </StyledView>



                <StyledTouchableOpacity className="w-4/5 mt-20">
                    <StyledView className="relative">
                        <LinearGradient
                            colors={['#ff2323', '#8023ff', '#235eff']}
                            start={[0, 0]}
                            end={[1, 0]}


                            className='py-3 my-4 px-5 rounded-full self-center duration-500 shadow-lg w-full'
                        >
                            <StyledText className="text-center text-white text-lg font-semibold">
                                เข้าสู่ระบบ
                            </StyledText>
                        </LinearGradient>
                    </StyledView>
                </StyledTouchableOpacity>

            </StyledView>
        </KeyboardAvoidingView>
    );
}
