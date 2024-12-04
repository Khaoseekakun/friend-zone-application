import { RootStackParamList } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import React, { useRef, useState } from 'react';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const { width, height } = Dimensions.get('screen'); // Get screen width for sliding

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledIonicons = styled(Ionicons);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledScrollView = styled(ScrollView);
export default function RegisterMember() {
    const [step, setStep] = useState(1); // Current step
    const animationValue = useRef(new Animated.Value(0)).current; // Animation value for sliding
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    //data 1 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneVerify, setPhoneVerify] = useState(false);
    const [registerType, setRegisterType] = useState('');
    const [getOtp, setGetOtp] = useState(false);

    //data 2
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [addredd, setAddress] = useState('');


    const nextStep = () => {
        if (step < 3) { // Assuming 3 steps
            if (step === 1) {
                if (phoneVerify != true || phone.length != 10 || otp.length != 6 || registerType == '' || username == '' || password == '' || email == '') {
                    //shake animation
                    Animated.sequence([
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width - 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width + 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width - 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width + 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                    ]).start();
                } else {
                    Animated.timing(animationValue, {
                        toValue: step * width,
                        duration: 300,
                        useNativeDriver: false,
                    }).start();

                    setStep(step + 1);
                }
            }
            else if (step === 2) {
                if (firstName == '' || lastName == '' || emergencyContact == '' || birthDate == '' || addredd == '') {
                    //shake animation
                    Animated.sequence([
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width - 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width + 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width - 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width + 2,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animationValue, {
                            toValue: (step - 1) * width,
                            duration: 100,
                            useNativeDriver: false,
                        }),
                    ]).start();
                } else {
                    Animated.timing(animationValue, {
                        toValue: step * width,
                        duration: 300,
                        useNativeDriver: false,
                    }).start();
                    setStep(step + 1);
                }
            }
            else {
                Animated.timing(animationValue, {
                    toValue: step * width,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
                setStep(step + 1);
            }
        }


    };


    const prevStep = () => {
        if (step > 1) {
            Animated.timing(animationValue, {
                toValue: (step - 2) * width, // Slide to the previous step
                duration: 300,
                useNativeDriver: false,
            }).start();
            setStep(step - 1);
        }
    };

    return (
        <StyledView className="bg-gray-200 w-full h-screen flex-1 justify-center">
            <StyledView className="w-full">
                <Animated.View
                    style={{
                        flexDirection: 'row',
                        width: width * 3, // Total width for 3 steps
                        transform: [{ translateX: Animated.multiply(animationValue, -1) }],
                    }}
                >
                    {/* Step 1 */}

                    <StyledView
                        style={{
                            width: width,
                            height: height * 0.87,
                            paddingLeft: 10, paddingRight: 10
                        }}
                    >
                        <StyledKeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                            className='h-full w-full items-center bg-white justify-center rounded-xl'
                        >
                            <StyledScrollView style={{
                                width: width * 0.97,
                            }} className='px-3'>
                                <StyledView className="flex items-center mt-[10%]">
                                    <StyledText className="font-custom text-3xl text-[#1e3a8a] mt-6">สร้างบัญชี</StyledText>
                                    <StyledText className="font-custom text-base text-gray-400">
                                        สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน
                                    </StyledText>
                                </StyledView>

                                <StyledView className="w-full mt-4">
                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            ชื่อผู้ใช้
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="ชื่อผู้ใช้"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={username}
                                            onChangeText={setUsername}
                                        />
                                    </StyledView>

                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            รหัสผ่าน
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="รหัสผ่าน"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={password}
                                            onChangeText={setPassword}
                                            inputMode='text'
                                            secureTextEntry
                                        />
                                    </StyledView>

                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            อีเมล
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="อีเมล"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={email}
                                            onChangeText={setEmail}
                                            inputMode='email'
                                        />
                                    </StyledView>

                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            เบอร์โทรศัพท์
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="เบอร์โทรศัพท์"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={phone}
                                            onChangeText={setPhone}
                                            inputMode='tel'
                                            enterKeyHint='done'
                                            autoCapitalize='none'
                                        />
                                    </StyledView>

                                    {
                                        phone.length === 10 && !phoneVerify ? (
                                            <>
                                                {
                                                    getOtp ? (
                                                        <StyledView className='flex-row items-end my-2'>
                                                            <StyledView className='w-9/12 pr-2'>


                                                                <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                                                    ยืนยันรหัส OTP
                                                                </StyledText>
                                                                <StyledTextInput
                                                                    placeholder="กรอกรหัส OTP"
                                                                    className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                                                    value={otp}
                                                                    onChangeText={setOtp}
                                                                    enterKeyHint='done'
                                                                    inputMode='numeric'
                                                                    autoComplete='sms-otp'

                                                                />
                                                            </StyledView>


                                                            <StyledView className='w-3/12'>
                                                                <StyledTouchableOpacity
                                                                    onPress={
                                                                        () => {
                                                                            setGetOtp(true);
                                                                        }
                                                                    }
                                                                    className="bg-[#1e3a8a] rounded-lg py-3 px-2"
                                                                >
                                                                    <StyledText className="text-white font-custom text-center">ยืนยัน</StyledText>
                                                                </StyledTouchableOpacity>
                                                            </StyledView>

                                                        </StyledView>
                                                    ) : (
                                                        <StyledTouchableOpacity
                                                            onPress={
                                                                () => {
                                                                    setGetOtp(true);
                                                                }
                                                            }
                                                            className="bg-[#1e3a8a] rounded-lg py-2 mt-6 px-8"
                                                        >
                                                            <StyledText className="text-white font-custom text-center">ยืนยันเบอร์โทรศัพท์</StyledText>
                                                        </StyledTouchableOpacity>
                                                    )
                                                }
                                            </>
                                        ) : null
                                    }

                                    <StyledTouchableOpacity
                                        onPress={nextStep}
                                        className="bg-[#1e3a8a] rounded-full py-3 mt-4 "
                                    >
                                        <StyledText className="text-white font-custom text-center">ถัดไป</StyledText>
                                    </StyledTouchableOpacity>
                                </StyledView>

                                <StyledTouchableOpacity
                                    onPress={() => navigation.navigate('SelectRegisterPage', {})}
                                    className="absolute top-0 left-0 mt-4"
                                >
                                    <StyledIonicons name="chevron-back" size={24} color="#1e3a8a" />
                                </StyledTouchableOpacity>
                            </StyledScrollView>
                        </StyledKeyboardAvoidingView>

                    </StyledView>

                    {/* Step 2 */}

                    <StyledView
                        style={{
                            width: width,
                            height: height * 0.87,
                            paddingLeft: 10, paddingRight: 10
                        }}
                    >
                        <StyledKeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                            className='h-full w-full items-center bg-white justify-center rounded-xl'
                        >
                            <StyledScrollView style={{
                                width: width * 0.97,
                            }} className='px-3'>
                                <StyledView className="flex items-center mt-[10%]">
                                    <StyledText className="font-custom text-3xl text-[#1e3a8a] mt-6">สร้างบัญชี</StyledText>
                                    <StyledText className="font-custom text-base text-gray-400">
                                        ข้อมูลส่วนตัวของสมาชิก
                                    </StyledText>
                                </StyledView>

                                <StyledView className="w-full mt-4">
                                    <StyledView className='my-2 flex-row items-center'>
                                        <StyledView className='w-6/12 pr-2'>
                                            <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                                ชื่อจริง
                                            </StyledText>
                                            <StyledTextInput
                                                placeholder="ชื่อผู้ใช้"
                                                className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                                value={firstName}
                                                onChangeText={setFirstName}
                                            />
                                        </StyledView>

                                        <StyledView className='w-6/12 pl-2'>
                                            <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                                นามสกุล
                                            </StyledText>
                                            <StyledTextInput
                                                placeholder="รหัสผ่าน"
                                                className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                                value={lastName}
                                                onChangeText={setLastName}
                                                inputMode='text'
                                            />
                                        </StyledView>

                                    </StyledView>

                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            การติดต่อฉุกเฉิน - เบอร์โทรศัพท์
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="เบอร์โทรศัพท์"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={emergencyContact}
                                            onChangeText={setEmergencyContact}
                                            inputMode='tel'
                                            enterKeyHint='done'
                                        />
                                    </StyledView>

                                    <StyledView className='my-2'>
                                        <StyledText className='font-custom text-gray-800 mb-1 pl-2'>
                                            วันเกิด
                                        </StyledText>
                                        <StyledTextInput
                                            placeholder="วันเกิด"
                                            className="font-custom bg-slate-200 rounded-xl py-3 p-3 text-gray-900 placeholder-gray-700"
                                            value={birthDate}
                                            onChangeText={setBirthDate}
                                            inputMode='text'
                                            editable={false}
                                        />
                                    </StyledView>

                                    <StyledTouchableOpacity
                                        onPress={nextStep}
                                        className="bg-[#1e3a8a] rounded-full py-3 mt-4 "
                                    >
                                        <StyledText className="text-white font-custom text-center">ถัดไป</StyledText>
                                    </StyledTouchableOpacity>
                                </StyledView>

                                <StyledTouchableOpacity
                                    onPress={() => prevStep()}
                                    className="absolute top-0 left-0 mt-4"
                                >
                                    <StyledIonicons name="chevron-back" size={24} color="#1e3a8a" />
                                </StyledTouchableOpacity>
                            </StyledScrollView>
                        </StyledKeyboardAvoidingView>

                    </StyledView>
                </Animated.View >
            </StyledView >
        </StyledView >
    );
}
