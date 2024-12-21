import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Dimensions,
    StatusBar,
    Image,
    Alert,
    Appearance, 
    useColorScheme 
} from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_SYSTEM_KEY } from '@/components/config';
import { set } from 'firebase/database';
import { ImageManipulator } from 'expo-image-manipulator';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    inputMode?: 'text' | 'numeric' | 'email';
    buttonText?: string;
    onBlur?: () => void;
    onButtonPress?: () => void;
    wrong?: boolean;
    secureTextEntry?: boolean;
    isPicker?: boolean;
    pickerItems?: { label: string, value: string }[];
    icon?: any;
    disable?: boolean;
    maxLength?: number;
    theme?: string;
}

const optimizeImage = async (uri: string) => {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            {
                compress: 0.7,
                format: ImageManipulator.SaveFormat.JPEG,
            }
        );
        return manipResult.uri;
    } catch (error) {
        console.error("Error optimizing image: ", error);
        return uri;
    }
};

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    inputMode,
    buttonText,
    onBlur,
    onButtonPress,
    wrong,
    secureTextEntry,
    isPicker,
    pickerItems,
    icon,
    disable,
    maxLength,
    theme
}) => (
    <StyledView className="w-full mb-7">
        <StyledText
            className={`font-custom text-sm ${wrong ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
                } mb-2 ml-4 absolute -mt-3 bg-white dark:bg-neutral-900 z-50 px-2`}
        >
            {label}
        </StyledText>
        <StyledView className="font-custom w-full relative">
            {isPicker && pickerItems ? (
                <StyledView className="relative">
                    <StyledView className="absolute left-4 top-4 z-10">
                        <Ionicons name={icon} size={20} color="#EB3834" />
                    </StyledView>
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
                                paddingLeft: 40,
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
                                paddingLeft: 40,
                                borderWidth: 1,
                                borderRadius: 25,
                                borderColor: wrong ? '#EF4444' : '#E5E7EB',
                                color: theme == "dark" ? "#FFF" : "#1F2937",
                                width: '100%',
                            },
                            iconContainer: {
                                top: 18,
                                right: 12,
                            }
                        }}
                        Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" />}
                    />
                </StyledView>
            ) : (
                <StyledView className="relative">
                    <StyledView className="absolute left-4 top-4 z-10">
                        <Ionicons name={icon} size={20} color="#EB3834" />
                    </StyledView>
                    <StyledTextInput
                        placeholder={placeholder}
                        className={`font-custom border ${wrong ? 'border-red-500' : 'border-gray-300'
                            } rounded-full py-4 px-4 pl-12 ${wrong ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'
                            } w-full`}
                        value={value}
                        onChangeText={onChangeText}
                        onBlur={onBlur}
                        inputMode={inputMode ?? 'text'}
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={secureTextEntry}
                        maxLength={maxLength}
                        
                    />
                    {buttonText && (
                        <StyledTouchableOpacity
                            onPress={onButtonPress}
                            disabled={disable}
                            className='mt-3'
                        >
                            <LinearGradient
                                colors={disable ? ['#ccc', '#ccc'] : ['#EB3834', '#69140F']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-4 px-4">

                                <StyledText className="text-white text-center font-custom">{buttonText}</StyledText>
                            </LinearGradient>
                        </StyledTouchableOpacity>
                    )}
                </StyledView>
            )}
        </StyledView>
    </StyledView>
);

export default function RegisterMember() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [currentStep, setCurrentStep] = useState(1);

    const [theme, setTheme] = useState(Appearance.getColorScheme());
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });


        return () => listener.remove();
    }, []);

    const colorScheme = useColorScheme();

    // Step 1: Account Info
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>(['']);

    // Step 2: Personal Info
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    // Step 3: Identity Verification
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [idCardImage, setIdCardImage] = useState<string | null>(null);

    // Step 4: Bank Info
    const [bankAccount, setBankAccount] = useState('');
    const [bankName, setBankName] = useState('');

    //otp
    const [showOTP, setShowOTP] = useState(false);
    const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
    const [cooldown, setCooldown] = useState(120);
    const [cooldownTime, setCooldownTime] = useState(120);
    const [loading, setLoading] = useState(false);
    const [verifyPhone, setVerifyPhone] = useState(false);
    const [cooldownMessage, setCooldownMessage] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(false);


    const banks = [
        { label: 'ธนาคารกสิกรไทย', value: 'kbank' },
        { label: 'ธนาคารไทยพาณิชย์', value: 'scb' },
        { label: 'ธนาคารกรุงเทพ', value: 'bbl' },
        { label: 'ธนาคารกรุงไทย', value: 'ktb' },
        { label: 'ธนาคารกรุงศรีอยุธยา', value: 'bay' }
    ];

    const services = [
        { label: 'เพื่อนเที่ยว', value: '673080a432edea568b2a6554' }
    ];

    const genders = [
        { label: 'ชาย', value: 'male' },
        { label: 'หญิง', value: 'female' },
        { label: 'lqbtq+', value: 'lgbtq' }
    ];

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleTakePhoto = async (type: 'selfie' | 'idCard') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('ขออนุญาตเข้าถึงกล้องไม่สำเร็จ');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            if (type === 'selfie') {
                if (result.assets[0].base64) {
                    setSelfieImage(result.assets[0].base64);
                }
            } else {
                if (result.assets[0].base64) {
                    setIdCardImage(result.assets[0].base64);
                }
            }
        }
    };

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
                        handleNext(true);
                    }
                } catch (error) {
                    Alert.alert("เตือน", "ไม่สามารถยืนยัน OTP ได้", [{ text: "ตกลง" }]);
                }
            } else {
                try {
                    setVerifyPhone(true);
                    handleNext();
                } catch (error) {
                    Alert.alert("เตือน", "ไม่สามารถยืนยัน OTP ได้", [{ text: "ตกลง" }]);
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

    const renderStepOne = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-white ">
                    ข้อมูลการติดต่อ
                </StyledText>
                <StyledText className="text-gray-500 font-custom dark:text-gray-400">
                    กรุณากรอกข้อมูลให้ครบถ้วน
                </StyledText>
            </StyledView>

            <InputField
                theme={theme ?? 'light'}
                label="ชื่อผู้ใช้"
                placeholder="น้องเพื่อนกัน"
                value={username}
                onChangeText={setUsername}
                icon="person-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="รหัสผ่าน"
                placeholder="รหัสผ่าน"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry={true}
            />

            <InputField
                theme={theme ?? 'light'}
                label="ยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmpassword}
                onChangeText={setConfirmPassword}
                icon="lock-closed-outline"
                secureTextEntry={true}
            />

            <InputField
                theme={theme ?? 'light'}
                label="อีเมล"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                inputMode='email'
            />

            <InputField
                theme={theme ?? 'light'}
                label={isPhoneValid == null && phone.length == 10 ? 'กำลังตรวจสอบ' : isPhoneValid == true && phone.length == 10 ? 'เบอร์โทรนี้ถูกใช้งานแล้ว' : 'เบอร์โทรศัพท์'}
                placeholder="0xxxxxxxxx"
                value={phone}
                onChangeText={((text) => {
                    setIsPhoneValid(null)
                    setPhone(text);
                    setVerifyPhone(false);
                    setOtp('')
                    setShowOTP(false);
                })}
                icon="call-outline"
                inputMode='numeric'
                buttonText={`รับ OTP`}
                disable={isPhoneValid != false || phone.length != 10 || otpButtonDisabled == true || phone.startsWith('0') == false}
                maxLength={10}
                onButtonPress={handlePhoneVerification}
                onBlur={verifyPhoneInvild}
            />

            {showOTP && (
                <InputField
                    theme={theme ?? 'light'}
                    label="OTP"
                    placeholder="รหัสยืนยัน"
                    inputMode="numeric"
                    value={otp}
                    onChangeText={setOtp}
                />
            )}

            <InputField
                theme={theme ?? 'light'}
                label="บริการที่สนใจ"
                placeholder="เลือกบริการ"
                value={selectedServices[0]}
                onChangeText={(value) => setSelectedServices([value])}
                isPicker={true}
                pickerItems={services}
                icon="apps-outline"
            />
            <StyledView className="h-32" />
        </ScrollView>
    );

    const renderStepTwo = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-white mb-2">
                    ข้อมูลส่วนตัว
                </StyledText>
                <StyledText className="text-gray-500 font-custom dark:text-gray-400">
                    กรุณากรอกข้อมูลให้ครบถ้วน
                </StyledText>
            </StyledView>

            <InputField
                theme={theme ?? 'light'}
                label="ชื่อ-นามสกุล"
                placeholder="ชื่อ-นามสกุล"
                value={fullName}
                onChangeText={setFullName}
                icon="person-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="อายุ"
                placeholder="อายุ"
                value={age}
                onChangeText={setAge}
                inputMode='numeric'
                icon="calendar-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="เพศ"
                placeholder="เลือกเพศ"
                value={gender}
                onChangeText={setGender}
                isPicker={true}
                pickerItems={genders}
                icon="people-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="ที่อยู่"
                placeholder="ที่อยู่ปัจจุบัน"
                value={address}
                onChangeText={setAddress}
                icon="location-outline"
            />

            <StyledText className="text-lg font-custom text-[#1e3a8a] mb-4 mt-6">
                ข้อมูลติดต่อฉุกเฉิน
            </StyledText>

            <InputField
                theme={theme ?? 'light'}
                label="ชื่อผู้ติดต่อ"
                placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                value={emergencyName}
                onChangeText={setEmergencyName}
                icon="person-add-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="เบอร์โทรศัพท์"
                placeholder="เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน"
                inputMode='numeric'
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                icon="call-outline"
            />

            <StyledView className="h-32" /> {/* Spacer for keyboard */}
        </ScrollView>
    );

    const renderStepThree = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-white  mb-2">
                    ยืนยันตัวตน
                </StyledText>
                <StyledText className="text-gray-500 font-custom dark:text-gray-400">
                    กรุณาถ่ายภาพเพื่อยืนยันตัวตน
                </StyledText>
            </StyledView>

            {/* ภาพถ่ายหน้าตรง */}
            <StyledView className="mb-8">
                <StyledText className="text-lg font-custom text-[#1e3a8a] dark:text-white mb-4">
                    ภาพถ่ายหน้าตรง
                </StyledText>
                <TouchableOpacity
                    onPress={() => handleTakePhoto('selfie')}
                    className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-2xl items-center border-2 border-dashed border-gray-300 dark:border-neutral-700"
                >
                    {selfieImage ? (
                        <Image
                            // base64
                            source={selfieImage ? { uri: `data:image/jpeg;base64,${selfieImage}` } : undefined}
                            style={{ width: 160, height: 160, borderRadius: 14 }}
                        />
                    ) : (
                        <>
                            <Ionicons name="camera" size={40} color={colorScheme === 'dark' ? '#EB3834': '#69140F'} />
                            <StyledText className="text-gray-500 mt-2 font-custom">
                                แตะเพื่อถ่ายภาพหน้าตรง
                            </StyledText>
                        </>
                    )
                    }
                </TouchableOpacity>
            </StyledView>

            {/* ภาพบัตรประชาชน */}
            <StyledView className="mb-8">
                <StyledText className="text-lg font-custom text-[#1e3a8a] dark:text-white mb-4">
                    ภาพบัตรประชาชน
                </StyledText>
                <TouchableOpacity
                    onPress={() => handleTakePhoto('idCard')}
                    className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-2xl items-center border-2 border-dashed border-gray-300 dark:border-neutral-700"
                >
                    {idCardImage ? (
                        <Image
                            source={idCardImage ? { uri: `data:image/jpeg;base64,${idCardImage}` } : undefined}
                            className="w-40 h-40 rounded-xl"
                        />
                    ) : (
                        <>
                            <Ionicons name="card" size={40} color={colorScheme === 'dark' ? '#EB3834': '#69140F'} />
                            <StyledText className="text-gray-500 mt-2 font-custom">
                                แตะเพื่อถ่ายภาพบัตรประชาชน
                            </StyledText>
                        </>
                    )}
                </TouchableOpacity>
            </StyledView>

            <StyledView className="h-32" />
        </ScrollView>
    );

    const renderStepFour = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-white mb-2">
                    ข้อมูลการเงิน
                </StyledText>
                <StyledText className="text-gray-500 font-custom dark:text-gray-400">
                    กรุณากรอกข้อมูลบัญชีธนาคารของคุณ
                </StyledText>
            </StyledView>

            <InputField
                theme={theme ?? 'light'}
                label="ธนาคาร"
                placeholder="เลือกธนาคาร"
                value={bankName}
                onChangeText={setBankName}
                isPicker={true}
                pickerItems={banks}
                icon="business-outline"
            />

            <InputField
                theme={theme ?? 'light'}
                label="เลขบัญชี"
                placeholder="กรอกเลขบัญชีธนาคาร"
                value={bankAccount}
                onChangeText={setBankAccount}
                icon="card-outline"
            />

            <StyledView className="bg-blue-50 dark:bg-neutral-800 p-4 rounded-xl mt-4">
                <StyledText className="text-sm text-gray-600 dark:text-white font-custom">
                    กรุณาตรวจสอบข้อมูลให้ถูกต้อง เพื่อการรับเงินที่รวดเร็ว
                </StyledText>
            </StyledView>

            <StyledView className="h-32" />
        </ScrollView>
    );

    const renderStepFive = () => (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            {/* Background Design */}

            {/* Content */}
            <StyledView className="px-6 pt-8">
                {/* Success Animation */}
                <StyledView className="items-center">
                    <StyledView className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-full shadow-lg items-center justify-center mb-4 p-2">
                        <LinearGradient
                            colors={colorScheme === 'dark' ? ['#EB3834', '#69140F']:['#ec4899', '#f97316']}
                            className="w-20 h-20 rounded-full items-center justify-center"
                        >
                            <Ionicons name="checkmark-sharp" size={40} color="white" />
                        </LinearGradient>
                    </StyledView>

                    <StyledText className="text-3xl font-custom text-[#1e3a8a] dark:text-white">
                        ยินดีต้อนรับ!
                    </StyledText>
                    <StyledText className="text-gray-500 text-lg font-custom mt-2 text-center">
                        คุณได้เป็นส่วนหนึ่งของครอบครัว FriendsZone แล้ว
                    </StyledText>
                </StyledView>

                {/* Status Card */}
                <StyledView className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-md mb-6 mt-3">
                    <StyledView className="flex-row items-center mb-4">
                        <StyledView className="w-2 h-2 rounded-full bg-[#EB3834] mr-2" />
                        <StyledText className="text-lg font-custom text-[#1e3a8a] dark:text-white">
                            สถานะการลงทะเบียน
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between bg-gray-50 dark:bg-neutral-900/25 p-4 rounded-xl">
                        <StyledView className="flex-row items-center">
                            <Ionicons name="time-outline" size={24} color="#EB3834" />
                            <StyledText className="ml-2 text-gray-600 dark:text-white">
                                อยู่ระหว่างการตรวจสอบ
                            </StyledText>
                        </StyledView>
                        <StyledText className="text-[#EB3834] font-custom">
                            3-7 วัน
                        </StyledText>
                    </StyledView>
                </StyledView>

                {/* What's Next Section */}
                {/* <StyledView className="bg-white rounded-3xl p-6 shadow-md mb-6">
                    <StyledView className="flex-row items-center mb-4">
                        <StyledView className="w-2 h-2 rounded-full bg-[#EB3834] mr-2" />
                        <StyledText className="text-lg font-custom text-[#1e3a8a]">
                            สิ่งที่คุณทำได้ตอนนี้
                        </StyledText>
                    </StyledView>

                    {[
                        {
                            icon: 'person-outline',
                            title: 'สร้างโปรไฟล์',
                            description: 'เพิ่มรูปภาพและข้อมูลส่วนตัว'
                        },
                        {
                            icon: 'search-outline',
                            title: 'สำรวจบริการ',
                            description: 'ดูบริการที่น่าสนใจได้'
                        },
                        {
                            icon: 'notifications-outline',
                            title: 'เปิดการแจ้งเตือน',
                            description: 'รับแจ้งเตือนเมื่อได้รับการอนุมัติ'
                        }
                    ].map((item, index) => (
                        <StyledView
                            key={index}
                            className="flex-row items-start p-4 bg-gray-50 rounded-xl mb-2"
                        >
                            <StyledView className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#EB3834" />
                            </StyledView>
                            <StyledView className="flex-1 ml-4">
                                <StyledText className="font-custom text-gray-800">
                                    {item.title}
                                </StyledText>
                                <StyledText className="text-gray-500">
                                    {item.description}
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    ))}
                </StyledView> */}

                {/* Slogan */}
                <StyledView className="items-center mb-8">
                    <LinearGradient
                        colors={colorScheme === 'dark' ? ['#EB3834', '#69140F']:['#ec4899', '#f97316']}
                        className="px-6 py-4 rounded-2xl"
                    >
                        <StyledText className="text-white text-lg font-custom text-center">
                            "เพราะคำว่าเพื่อน สำคัญที่สุด"
                        </StyledText>
                    </LinearGradient>
                </StyledView>
            </StyledView>
        </ScrollView>
    );

    const verifyPhoneInvild = async () => {
        try {
            const userPhoneChecker = await axios.get(`https://friendszone.app/api/customer?phone=${phone}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `System ${API_SYSTEM_KEY}`,
                },
            });

            const memberPhoneChecker = await axios.get(`https://friendszone.app/api/member?phone=${phone}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `System ${API_SYSTEM_KEY}`,
                },
            });

            if (userPhoneChecker.data.status != 404 || memberPhoneChecker.data.status != 404) {
                return setIsPhoneValid(true);
            } else {
                return setIsPhoneValid(false);
            }
        } catch (error) {
            console.error(error);
            return Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบเบอร์โทรศัพท์ได้');
        }
    }

    const handleNext = async (bypass?: boolean) => {
        if (currentStep < 5) {
            if (currentStep === 1) {
                // check data is empty
                if (!username || !password || !confirmpassword || !email || !phone) {
                    Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
                    return
                }

                if (password !== confirmpassword) {
                    Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านให้ตรงกัน');
                    return;
                }

                try {
                    const userChecker = await axios.get(`https://friendszone.app/api/customer?username=${username}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `System ${API_SYSTEM_KEY}`,
                        },
                    });

                    const memberChecker = await axios.get(`https://friendszone.app/api/member?username=${username}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `System ${API_SYSTEM_KEY}`,
                        },
                    });

                    if (memberChecker.data.status != 404 || userChecker.data.status != 404) {
                        return Alert.alert('เกิดข้อผิดพลาด', 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
                    }

                } catch (error: any) {
                    console.error(error);
                    return Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบชื่อผู้ใช้ได้');
                }

            }

            if (currentStep === 2) {
                if (!fullName || !age || !gender || !address || !emergencyName || !emergencyPhone) {
                    Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
                    return;
                }
            }

            if (currentStep === 3) {
                if (!selfieImage || !idCardImage) {
                    Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาถ่ายภาพเพื่อยืนยันตัวตน');
                    return;
                }
            }

            if (currentStep === 4) {
                if (!bankAccount || !bankName) {
                    Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลบัญชีธนาคารของคุณ');
                    return;
                } else {
                    try {
                        setLoading(true)

                        const registerResponse = await axios.post('https://friendszone.app/api/member/register', {
                            username: username,
                            password: password,
                            email: email,
                            phone: phone,
                            service: selectedServices[0],
                            fullname: fullName,
                            age: Number(age),
                            gender: gender,
                            address: address,
                            emergencyName: emergencyName,
                            emergencyPhone: emergencyPhone,
                            selfieImage: selfieImage,
                            idCardImage: idCardImage,
                            bankAccount: bankAccount,
                            bankName: bankName
                        }, {
                            headers: {
                                Authorization: `System ${API_SYSTEM_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        })


                        setLoading(false)
                        if (registerResponse.data.status === 200) {
                            return setCurrentStep(currentStep + 1);
                        } else {
                            console.log(registerResponse.data)
                            return Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลงทะเบียนได้ โปรดตรวจสอบข้อมูลให้ถูกต้อง');
                        }
                    } catch (error) {
                        console.error(error);
                        setLoading(false)
                        return Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลงทะเบียนได้ โปรดตรวจสอบข้อมูลให้ถูกต้อง');
                    }

                }
            }
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-neutral-900"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
        >
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                <StyledView className="flex-row items-center px-6 py-4">
                    {currentStep != 5 && (
                        <TouchableOpacity
                            onPress={handleBack}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mr-2"
                        >
                            <Ionicons name="arrow-back" size={24} color="#EB3834" />
                        </TouchableOpacity>
                    )}
                    <StyledView className="flex-1 items-center">
                        <StyledText className="text-gray-500 dark:text-gray-200 font-custom">
                            ขั้นตอนที่ {currentStep}/5
                        </StyledText>
                    </StyledView>
                    {
                        currentStep != 5 && (
                            <StyledView className="w-10" />
                        )
                    }
                </StyledView>

                {/* Step Indicators */}
                <StyledView className="flex-row justify-between px-6 py-4">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <StyledView
                            key={step}
                            className={`h-1 flex-1 mx-1 rounded-full ${step <= currentStep ? 'bg-[#EB3834]' : 'bg-gray-200'}`}
                        />
                    ))}
                </StyledView>

                {/* Content */}
                <StyledView className="flex-1">
                    {currentStep === 1 && renderStepOne()}
                    {currentStep === 2 && renderStepTwo()}
                    {currentStep === 3 && renderStepThree()}
                    {currentStep === 4 && renderStepFour()}
                    {currentStep === 5 && renderStepFive()}
                </StyledView>

                {/* Footer */}
                <StyledView className="px-6 py-4">
                    <TouchableOpacity
                        onPress={() => {
                            if (currentStep === 1) {
                                // handleVerifyOTP();
                                handleNext();
                            } else {
                                if (currentStep === 5) {
                                    navigation.navigate('Login', {});
                                } else {
                                    handleNext()
                                }
                            }
                        }}
                        className={`rounded-full overflow-hidden `}
                    >
                        <LinearGradient
                            colors={colorScheme === 'dark' ? ['#EB3834', '#69140F']:['#ec4899', '#f97316']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4"
                        >
                            <StyledText className="text-white text-center text-lg font-custom">
                                {currentStep === 5 ? 'เสร็จสิ้น' : 'ถัดไป'}
                            </StyledText>
                        </LinearGradient>
                    </TouchableOpacity>
                </StyledView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}