import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, InputModeOptions, Alert, Animated, ActivityIndicator, Appearance, TouchableWithoutFeedback, Keyboard, useColorScheme } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import { set } from 'firebase/database';
import { API_SYSTEM_KEY } from '@/components/config';


const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledDatePicker = styled(DateTimePicker);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledIcon = styled(Ionicons);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
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
    theme?: string;
}
interface Province {
    id: string;
    name: string;
}

type RegisterStepTwoRouteProp = RouteProp<RootStackParamList, 'RegisterStepTwo'>;
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
    wrong,
    theme
}) => (
    <StyledView className="w-full mb-7">
        <StyledText className={`font-custom text-sm ${wrong == true ? 'text-red-500' : 'text-gray-600 dark:text-gray-200'} mb-2 ml-4 absolute -mt-3 bg-white dark:bg-neutral-900 z-50 px-2`}>{label}</StyledText>
        <StyledView className="flex-row items-center">
            {isPicker && pickerItems && (
                <StyledView className="w-full border-[1px] border-gray-300 rounded-full">
                <RNPickerSelect
                    onValueChange={onChangeText}
                    items={pickerItems}
                    value={value ?? ''}
                    useNativeAndroidPickerStyle={false}
                    placeholder={{ label: placeholder, value: null }}
                    style={{
                        inputIOS: {
                            fontFamily: 'Kanit',
                            fontSize: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            borderWidth: 1,
                            borderRadius: 25,
                            borderColor: wrong ? '#EF4444' : '#E5E7EB',
                            color: theme == "dark" ? "#FFF" : "#1F2937",
                            width: '100%',
                        },
                        inputAndroid: {
                            fontFamily: 'Kanit',
                            fontSize: 16,
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            borderWidth: 1,
                            borderRadius: 25,
                            borderColor: wrong ? '#EF4444' : '#E5E7EB',
                            color: theme == "dark" ? "#FFF" : "#1F2937",
                            width: '100%',
                        },
                        placeholder: {
                            color: '#9CA3AF',
                            fontFamily: 'Kanit',
                        },
                        iconContainer: {
                            top: 18,
                            right: 12,
                        }
                    }}
                    Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" />}
                />
            </StyledView>
            )}

            {!isPicker && (
                <>
                    <StyledTextInput
                        placeholder={placeholder}
                        className={`font-custom border ${wrong == true ? 'border-red-500' : 'border-gray-300'} rounded-full py-4 px-4 ${wrong == true ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'} ${buttonText ? 'flex-1 mr-2' : 'w-full'}`}
                        value={value}
                        onChangeText={onChangeText}
                        placeholderTextColor="#d1d5db"
                        editable={editable}
                        onPress={onPress}
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
                                colors={disable ? ['#ccc', '#ccc'] : ['#EB3834', '#69140F']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-4 px-4">

                                <StyledText className="text-white text-center font-custom">{buttonText}</StyledText>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </>
            )}

        </StyledView>
    </StyledView>
);

export default function RegisterStepTwo() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);

    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [showBirthdate, setShowBirthdate] = useState<Date>();
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
    const [cooldownMessage, setCooldownMessage] = useState('');
    const [cooldownTime, setCooldown] = useState(0);
    const [verifyPhone, setVerifyPhone] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(null as boolean | null);
    const [loading, setLoading] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;



    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));
    const minDate = new Date(today.setFullYear(today.getFullYear() - 70));

    const [provinces, setProvinces] = useState<{ value: string; label: string }[]>([]); // สำหรับเก็บรายการจังหวัด
    const [province, setProvince] = useState(''); // สำหรับเก็บค่าที่เลือก

    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });


        return () => listener.remove();
    }, []);

    const route = useRoute<RegisterStepTwoRouteProp>();

    const { username, password } = route.params

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirm = (date: Date) => {
        setShowBirthdate(date);
        const formattedDate = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

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
        { label: 'lgbtq+', value: 'lgbtl+' },
    ];

    // const provinceOptions = [
    //     { label: 'Nakhon Ratchasima', value: 'Nakhon Ratchasima' }
    // ];

    const handlePhoneVerification = async () => {
        if (!phone) return Alert.alert("เตือน", "กรุณากรอกหมายเลขมือถือ", [{ text: "ตกลง" }]);
        if (!phone.match(/^0[0-9]{9}$/)) return Alert.alert("เตือน", "หมายเลขมือถือต้องขึ้นต้นด้วย 0 และมี 10 หลัก", [{ text: "ตกลง" }]);
        if (!phone.startsWith('0')) return Alert.alert("เตือน", "หมายเลขมือถือต้องขึ้นต้นด้วย 0", [{ text: "ตกลง" }]);
        if (phone.length !== 10) return Alert.alert("เตือน", "หมายเลขมือถือต้องมี 10 หลัก", [{ text: "ตกลง" }]);

        try {
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
            setCooldown(120)

            const cooldown = setInterval(() => {
                setOtpButtonDisabled(false);
                setCooldownMessage(`${cooldownTime}s`) // 120s 
                if (cooldownTime <= 0) {
                    clearInterval(cooldown);
                    setCooldownMessage('')
                } else {
                    setCooldown(cooldownTime - 1)
                }
            }, 1000);
            setShowOTP(true);
        } catch (error) {
            Alert.alert("เตือน", "ไม่สามารถส่ง OTP ได้", [{ text: "ตกลง" }]);
            console.error(error);
        }
    };

    // const provinces = [
    //     { label: 'กรุงเทพมหานคร', value: '1' },
    //     { label: 'กระบี่', value: '2' },
    //     { label: 'กาญจนบุรี', value: '3' }
    // ];
    const fetchProvinces = async () => {
        try {
            const response = await axios.get('https://friendszone.app/api/province', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const provincesData = response.data.body.map((province: any) => ({
                value: province.id || 'test',
                label: province.name || 'test',
            }));
            setProvinces(provincesData);
            console.log('Provinces loaded:', provincesData);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลจังหวัดได้');
        }
    };
    useEffect(() => {
        fetchProvinces();
    }, []);


    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            if (otp == '') return Alert.alert("เตือน", "กรุณากรอกรหัสยืนยัน", [{ text: "ตกลง" }]);
            if (verifyPhone == false) {
                const validationError = validateOTP(otp);
                if (validationError) return Alert.alert("เตือน", validationError, [{ text: "ตกลง" }]);

                try {
                    const verificationResponse = await verifyOTP(phone, otp);
                    if (verificationResponse.status !== 200) return Alert.alert("เตือน", "รหัสยืนยันไม่ถูกต้อง", [{ text: "ตกลง" }]);
                    if (verificationResponse.data.data.status !== 'approved' || !verificationResponse.data.data.valid) {
                        return Alert.alert("เตือน", "รหัสยืนยันไม่ถูกต้อง", [{ text: "ตกลง" }]);
                    } else {

                        setVerifyPhone(true);
                        await createCustomerAccount();
                        Alert.alert("สำเร็จ", "สร้างบัญชีสำเร็จ", [{ text: "ตกลง", onPress: () => navigation.navigate('Login', {}) }]);
                    }
                } catch (error) {
                    handleError(error, 'ไม่สามารถตรวจสอบได้');
                }
            } else {
                try {
                    await createCustomerAccount();
                    Alert.alert("สำเร็จ", "สร้างบัญชีสำเร็จ", [{ text: "ตกลง", onPress: () => navigation.navigate('Login', {}) }]);
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

    const verifyOTP = async (phone: string, otp: string) => {
        return await axios.put('https://friendszone.app/api/otp', {
            phone: phone,
            code: otp,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `System ${API_SYSTEM_KEY}`,
            },
        });
    };

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

    const handleError = (error: any, fallbackMessage: string) => {
        alert(fallbackMessage);
    };



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className='flex-1 bg-white dark:bg-neutral-900 h-full'>
                <StyledView className="flex-1 pt-6 px-6">
                    <StyledTouchableOpacity onPress={() => navigation.goBack()} className="mt-14">
                        <StyledIcon name="chevron-back" size={24} className='text-[#1e3a8a] dark:text-white' />
                    </StyledTouchableOpacity>

                    <StyledView className="self-center flex items-center mb-5 mt-5">
                        <StyledText className="font-custom text-3xl text-[#1e3a8a] dark:text-white mb-2">ข้อมูลส่วนตัว</StyledText>
                        <StyledText className="font-custom text-base text-gray-400">กรอกเบอร์มือถือและยืนยันเบอร์มือถือของคุณ</StyledText>
                    </StyledView>

                    <StyledView className='flex-1'>
                        <InputField
                            theme={theme ?? "light"}
                            label="เพศ"
                            placeholder="เลือกเพศของคุณ"
                            value={gender}
                            onChangeText={setGender}
                            isPicker={true}
                            pickerItems={genderOptions}
                        />

                        <InputField
                            theme={theme ?? "light"}
                            label="วันเกิด"
                            placeholder="เลือกวันเกิดของคุณ"
                            value={birthdate}
                            onChangeText={setBirthdate}
                            onPress={showDatePicker}
                        />
                        <InputField
                            theme={theme ?? 'light'}
                            label="จังหวัด"
                            placeholder="เลือกจังหวัด"
                            value={province}
                            onChangeText={(value) => setProvince(value)}
                            isPicker={true}
                            pickerItems={provinces}
                        />

                        <InputField
                            theme={theme ?? "light"}
                            label={`${isPhoneValid ? 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' : 'เบอร์โทรศัพท์'}`}
                            placeholder="+66"
                            inputMode="numeric"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            buttonText={`${cooldownTime > 0 ? `${cooldownMessage}` : 'รับ OTP'}`}
                            maxLength={10}
                            onButtonPress={handlePhoneVerification}
                            onBlur={handleCheckPhone}
                            disable={isPhoneValid != false || phone.length != 10 || otpButtonDisabled == true}
                            wrong={(isPhoneValid != null) && (isPhoneValid && phone.length == 10)}

                        />

                        {showOTP && (
                            <InputField
                                theme={theme ?? "light"}
                                label="OTP"
                                placeholder="รหัสยืนยัน"
                                inputMode="tel"
                                value={otp}
                                onChangeText={setOtp}
                            />
                        )}

                        <TouchableOpacity className="w-full mt-8" onPress={() => handleVerifyOTP()}>
                            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                                <LinearGradient
                                    colors={colorScheme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-full py-3 shadow-sm"
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <StyledText className="font-custom text-center text-white text-lg font-semibold">ถัดไป</StyledText>
                                    )}
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>
            </StyledView>


            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                locale="th-TH"
                maximumDate={maxDate}
            />
        </KeyboardAvoidingView>
    );
}
