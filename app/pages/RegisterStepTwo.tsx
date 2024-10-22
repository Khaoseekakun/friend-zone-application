import React, { useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, InputModeOptions, Alert, Animated, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from 'react-native-picker-select';
const API_SYSTEM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzeXN0ZW0iOnRydWUsInBlcm1pc3Npb25zIjp7Ik1hbmFnZU90cCI6dHJ1ZSwiTm90aWZpY2F0aW9ucyI6dHJ1ZSwiTWFuYWdlQWRtaW5zIjp0cnVlLCJNYW5hZ2VQYXltZW50cyI6dHJ1ZSwiTWFuYWdlQ3VzdG9tZXIiOnRydWUsIk1hbmFnZU1lbWJlcnMiOnRydWUsIk1hbmFnZVBvc3RzIjp0cnVlLCJNYW5hZ2VTY2hlZHVsZSI6dHJ1ZSwiTWFuYWdlU2V0dGluZ3MiOnRydWV9LCJpYXQiOjE3MjY5NTIxODN9.LZqnLm_8qvrL191MV7OIpUSczeFgGupOb5Pp2UOvyTE';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);


interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onPress?: () => void;
    editable?: boolean;
    buttonText?: string;
    onButtonPress?: () => void;
    isPicker?: boolean;
    pickerItems?: { label: string; value: string }[];
    inputMode?: InputModeOptions;
    maxLength?: number;
    disable?: boolean;
    onBlur?: () => void;
    wrong?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    inputMode,
    onChangeText,
    onPress,
    editable = true,
    buttonText,
    onButtonPress,
    isPicker,
    pickerItems,
    maxLength,
    disable,
    onBlur,
    wrong
}) => (
    <StyledView className="w-full mb-7">
        <StyledText className={`text-sm ${wrong == true ? 'text-red-500' : 'text-gray-600'} mb-2 ml-4 absolute -mt-3 bg-white z-50 px-2`}>{label}</StyledText>
        <StyledView className="flex-row items-center">
            {isPicker && pickerItems && (
                <StyledView className="w-full">
                    <RNPickerSelect

                        onValueChange={onChangeText}
                        items={pickerItems}
                        value={value}
                        placeholder={{ label: placeholder, value: null }}
                        style={{
                            inputIOS: {
                                padding: 16,
                                borderWidth: 1,
                                borderRadius: 25,
                                borderColor: '#ccc',
                                color: '#333',
                                width: '100%',
                                backgroundColor: '#fff'
                            },
                            inputAndroid: {
                                padding: 16,
                                borderWidth: 1,
                                borderRadius: 25,
                                borderColor: '#ccc',
                                color: '#333',
                                width: '100%',
                                backgroundColor: '#fff',
                            },

                        }}

                    />
                </StyledView>
            )}

            {!isPicker && (
                <>
                    <StyledTextInput
                        placeholder={placeholder}
                        className={`border ${wrong == true ? 'border-red-500' : 'border-gray-300'} rounded-full py-4 px-4 ${wrong == true ? 'text-red-500' : 'text-gray-700'} ${buttonText ? 'flex-1 mr-2' : 'w-full'}`}
                        value={value}
                        onChangeText={onChangeText}
                        placeholderTextColor="#9CA3AF"
                        editable={editable}
                        onPressIn={onPress}
                        inputMode={inputMode}
                        maxLength={maxLength}
                        onBlur={onBlur}
                        enterKeyHint='done'
                    />
                    {buttonText && (
                        <TouchableOpacity
                            onPress={onButtonPress}
                            disabled={disable}
                        >
                            <LinearGradient
                                colors={disable ? ['#ccc', '#ccc'] : ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-3 px-4">

                                <StyledText className="text-white text-center">{buttonText}</StyledText>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </>
            )}

        </StyledView>
    </StyledView>
);
type RegisterStepTwoRouteProp = RouteProp<RootStackParamList, 'RegisterStepTwo'>;

export default function RegisterStepTwo() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);

    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [province, setProvince] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
    const [cooldownMessage, setCooldownMessage] = useState('');
    const [cooldownTime, setCooldown] = useState(0);
    const [verifyPhone, setVerifyPhone] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(null as boolean | null);
    const [loading, setLoading] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;

    const route = useRoute<RegisterStepTwoRouteProp>();

    const { username, password } = route.params

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        const formattedDate = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        console.log(formattedDate)
        setBirthdate(formattedDate);
        hideDatePicker();
    };


    const handlePhoneChange = (text: string) => {
        setPhone(text);
        setIsPhoneValid(null);
    }

    const handleCheckPhone = async () => {
        try {
            const userChecker = await axios.get(
                `https://friendszone.app/api/customer?phone=${phone}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `System ${API_SYSTEM_KEY}`,
                    },
                }
            );
            if (userChecker.data.status === 200) {
                setIsPhoneValid(true);
            } else {
                setIsPhoneValid(false);
            }
        } catch (error: any) {
            console.log(error);
        }
    }

    const genderOptions = [
        { label: 'ชาย', value: 'ชาย' },
        { label: 'หญิง', value: 'หญิง' },
    ];

    const provinceOptions = [
        { label: 'นครราชสีมา', value: 'นครราชสีมา' }
    ];
    const handlePhoneVerification = async () => {
        if (!phone) return Alert.alert("เตือน", "กรุณากรอกหมายเลขมือถือ", [{ text: "ตกลง" }]);
        if (!phone.match(/^0[0-9]{9}$/)) return Alert.alert("เตือน", "หมายเลขมือถือต้องขึ้นต้นด้วย 0 และมี 10 หลัก", [{ text: "ตกลง" }]);
        if (!phone.startsWith('0')) return Alert.alert("เตือน", "หมายเลขมือถือต้องขึ้นต้นด้วย 0", [{ text: "ตกลง" }]);
        if (phone.length !== 10) return Alert.alert("เตือน", "หมายเลขมือถือต้องมี 10 หลัก", [{ text: "ตกลง" }]);

        try {
            // Adjusted GET request to send phone as query parameter
            const response = await axios.post(
                'https://friendszone.app/api/otp',
                { phone: phone },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `System ${API_SYSTEM_KEY}`
                    }
                }
            );
            if (response.data.status !== 200) return Alert.alert("เตือน", "ไม่สามารถส่ง OTP ได้", [{ text: "ตกลง" }]);

            setOtpButtonDisabled(true);
            //message otp cooldown
            setCooldown(120)

            const cooldown = setInterval(() => {
                setOtpButtonDisabled(false);
                setCooldownMessage(`${cooldownTime}s`) // 120s 
                if (cooldownTime <= 0) {
                    clearInterval(cooldown);
                    setCooldownMessage('')
                }else{
                    setCooldown(cooldownTime - 1)
                }
            }, 1000);



            setShowOTP(true);
        } catch (error) {
            Alert.alert("เตือน", "ไม่สามารถส่ง OTP ได้", [{ text: "ตกลง" }]);
            console.error(error);
        }
    };


    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            if (otp == '') return Alert.alert("เตือน", "กรุณากรอกรหัสยืนยัน", [{ text: "ตกลง" }]);
            if (verifyPhone == false) {
                const validationError = validateOTP(otp);
                if (validationError) return Alert.alert("เตือน", validationError, [{ text: "ตกลง" }]);

                try {
                    const verificationResponse = await verifyOTP(phone, otp);
                    console.log(verificationResponse.data)
                    if (verificationResponse.status !== 200) return Alert.alert("เตือน", "รหัสยืนยันไม่ถูกต้อง", [{ text: "ตกลง" }]);
                    if (verificationResponse.data.data.status !== 'approved' || !verificationResponse.data.data.valid) {
                        return Alert.alert("เตือน", "รหัสยืนยันไม่ถูกต้อง", [{ text: "ตกลง" }]);
                    } else {

                        setVerifyPhone(true);
                        await createCustomerAccount();
                        Alert.alert("สำเร็จ", "สร้างบัญชีสำเร็จ", [{ text: "ตกลง", onPress: () => navigation.navigate('Login') }]);
                    }
                } catch (error) {
                    handleError(error, 'ไม่สามารถตรวจสอบได้');
                }
            } else {
                try {
                    await createCustomerAccount();
                    Alert.alert("สำเร็จ", "สร้างบัญชีสำเร็จ", [{ text: "ตกลง", onPress: () => navigation.navigate('Login') }]);
                } catch (error) {
                    handleError(error, 'เกิดข้อผิดพลาดไม่สามารถเชื่อมต่อกับระบบได้');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const validateOTP = (otp: string) => {
        if (!otp) return 'กรุณากรอกรหัสยืนยัน';
        if (otp.length !== 6) return 'รหัสยืนยันต้องมี 6 หลัก';
        return null;
    };

    // Verify the OTP with the backend
    const verifyOTP = async (phone: string, otp: string) => {
        return await axios.put('https://friendszone.app/api/otp', {
            phone : phone,
            code: otp,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `System ${API_SYSTEM_KEY}`,
            },
        });
    };

    // Create the customer account
    const createCustomerAccount = async () => {
        const response = await axios.post('https://friendszone.app/api/customer', {
            username,
            password,
            phone,
            gender,
            province,
            birthdate,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `System ${API_SYSTEM_KEY}`,
            }
        });

        console.log(response.data);
        if (response.data.status !== 200) throw new Error('ไม่สามารถสร้างบัญชีได้');
    };

    // Handle errors and provide an alert
    const handleError = (error: any, fallbackMessage: string) => {
        alert(fallbackMessage);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="flex-1 bg-white px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-6">
                    <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>

                <StyledView className='flex-1 justify-center'>


                    <StyledView className="flex items-center mb-5">
                        <StyledText className="text-3xl font-bold text-[#1e3a8a] mt-6 mb-2">ข้อมูลส่วนตัว</StyledText>
                        <StyledText className="text-base text-gray-400">กรอกเบอร์มือถือและยืนยันเบอร์มือถือของคุณ</StyledText>
                    </StyledView>
                    <InputField
                        label="เพศ"
                        placeholder="เลือกเพศของคุณ"
                        value={gender}
                        onChangeText={setGender}
                        isPicker={true}
                        pickerItems={genderOptions}
                    />
                    <InputField
                        label="วันเกิด"
                        placeholder="เลือกวันเกิดของคุณ"
                        value={birthdate}
                        onChangeText={setBirthdate}
                        onPress={showDatePicker}
                        editable={false}
                    />
                    <InputField
                        label="จังหวัด"
                        placeholder="เลือกจังหวัดของคุณ"
                        value={province}
                        onChangeText={setProvince}
                        isPicker={true}
                        pickerItems={provinceOptions}
                    />

                    <StyledView className="space-y-6">
                        <InputField
                            label={`${isPhoneValid ? 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' : 'เบอร์โทรศัพท์'}`}
                            placeholder="+66"
                            inputMode="tel"
                            value={phone}
                            onBlur={handleCheckPhone}
                            onChangeText={handlePhoneChange}
                            buttonText={`${cooldownTime > 0 ? `${cooldownMessage}` : 'รับ OTP'}`}
                            maxLength={10}
                            onButtonPress={handlePhoneVerification}
                            disable={isPhoneValid != false || phone.length != 10 || otpButtonDisabled == true}
                            wrong={(isPhoneValid != null) && (isPhoneValid && phone.length == 10)}

                        />

                        {showOTP && (
                            <InputField
                                label="OTP"
                                placeholder="รหัสยืนยัน"
                                inputMode="tel"
                                value={otp} // Use separate state for OTP
                                onChangeText={setOtp}

                            />
                        )}
                    </StyledView>

                    <TouchableOpacity className="w-full mt-8" onPress={() => handleVerifyOTP()}>
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <LinearGradient
                                colors={['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-3 shadow-sm"
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <StyledText className="text-center text-white text-lg font-semibold">ถัดไป</StyledText>
                                )}
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </StyledView>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                    locale="th-TH"
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                />
            </StyledView>
        </KeyboardAvoidingView>
    );
}
