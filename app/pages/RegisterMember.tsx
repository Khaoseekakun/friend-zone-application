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
    StatusBar
} from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    wrong?: boolean;
    secureTextEntry?: boolean;
    isPicker?: boolean;
    pickerItems?: { label: string; value: string }[];
    icon?: any;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    wrong,
    secureTextEntry,
    isPicker,
    pickerItems,
    icon
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
                        value={value}
                        useNativeAndroidPickerStyle={false}
                        placeholder={{ label: placeholder, value: null }}
                        style={{
                            inputIOS: {
                                fontSize: 16,
                                paddingVertical: 16,
                                paddingHorizontal: 16,
                                paddingLeft: 40,
                                borderWidth: 1,
                                borderRadius: 25,
                                borderColor: wrong ? '#EF4444' : '#E5E7EB',
                                color: '#1F2937',
                                width: '100%',
                            },
                            inputAndroid: {
                                fontSize: 16,
                                paddingHorizontal: 16,
                                paddingVertical: 16,
                                paddingLeft: 40,
                                borderWidth: 1,
                                borderRadius: 25,
                                borderColor: wrong ? '#EF4444' : '#E5E7EB',
                                color: '#1F2937',
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
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={secureTextEntry}
                    />
                </StyledView>
            )}
        </StyledView>
    </StyledView>
);

export default function RegisterMember() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [currentStep, setCurrentStep] = useState(1);
    const [pageLoading, setPageLoading] = useState(false);

    // Step 1: Account Info
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Step 2: Personal Info
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [idCardImage, setIdCardImage] = useState<string | null>(null);
    const [bankAccount, setBankAccount] = useState('');
    const [bankName, setBankName] = useState('');
    
    const banks = [
        { label: 'ธนาคารกสิกรไทย', value: 'kbank' },
        { label: 'ธนาคารไทยพาณิชย์', value: 'scb' },
        { label: 'ธนาคารกรุงเทพ', value: 'bbl' },
        { label: 'ธนาคารกรุงไทย', value: 'ktb' },
        { label: 'ธนาคารกรุงศรีอยุธยา', value: 'bay' }
    ];

    const services = [
        { label: 'เพื่อนเที่ยว', value: 'travel_buddy' },
        { label: 'วงดนตรี', value: 'band' },
        { label: 'นักร้อง', value: 'singer' },
        { label: 'MC', value: 'mc' },
        { label: 'DJ', value: 'dj' },
        { label: 'พิธีกร', value: 'host' }
    ];

    const genders = [
        { label: 'ชาย', value: 'male' },
        { label: 'หญิง', value: 'female' },
        { label: 'ไม่ระบุ', value: 'not_specified' },
        { label: 'อื่นๆ', value: 'other' }
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
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            if (type === 'selfie') {
                setSelfieImage(result.assets[0].uri);
            } else {
                setIdCardImage(result.assets[0].uri);
            }
        }
    };

    const renderStepOne = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-bold text-[#1e3a8a] dark:text-white mb-2">
                    ข้อมูลการติดต่อ
                </StyledText>
                <StyledText className="text-gray-500 dark:text-gray-400">
                    กรุณากรอกข้อมูลให้ครบถ้วน
                </StyledText>
            </StyledView>

            <InputField
                label="ชื่อผู้ใช้"
                placeholder="น้องเพื่อนกัน"
                value={username}
                onChangeText={setUsername}
                icon="person-outline"
            />

            <InputField
                label="รหัสผ่าน"
                placeholder="รหัสผ่าน"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
            />

            <InputField
                label="ยืนยันรหัสผ่าน"
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmpassword}
                onChangeText={setConfirmPassword}
                icon="lock-closed-outline"
            />

            <InputField
                label="อีเมล"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
            />

            <InputField
                label="เบอร์โทรศัพท์"
                placeholder="0xxxxxxxxx"
                value={phone}
                onChangeText={setPhone}
                icon="call-outline"
            />

            <InputField
                label="บริการที่สนใจ"
                placeholder="เลือกบริการ"
                value={selectedServices[0]}
                onChangeText={(value) => setSelectedServices([value])}
                isPicker={true}
                pickerItems={services}
                icon="apps-outline"
            />

            <TouchableOpacity
                className="flex-row items-center mb-8 mt-4"
                onPress={() => setAcceptTerms(!acceptTerms)}
            >
                <StyledView
                    className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center
            ${acceptTerms ? 'bg-[#EB3834] border-[#EB3834]' : 'border-gray-300'}`}
                >
                    {acceptTerms && <Ionicons name="checkmark" size={18} color="white" />}
                </StyledView>
                <StyledText className="flex-1 text-gray-600 dark:text-gray-300">
                    ยอมรับข้อกำหนดและเงื่อนไขการใช้งาน
                </StyledText>
            </TouchableOpacity>

            <StyledView className="h-32" /> {/* Spacer for keyboard */}
        </ScrollView>
    );

    const renderStepTwo = () => (
        <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <StyledView className="mb-8 mt-4">
                <StyledText className="text-3xl font-bold text-[#1e3a8a] dark:text-white mb-2">
                    ข้อมูลส่วนตัว
                </StyledText>
                <StyledText className="text-gray-500 dark:text-gray-400">
                    กรุณากรอกข้อมูลให้ครบถ้วน
                </StyledText>
            </StyledView>

            <InputField
                label="ชื่อ-นามสกุล"
                placeholder="ชื่อ-นามสกุล"
                value={fullName}
                onChangeText={setFullName}
                icon="person-outline"
            />

            <InputField
                label="อายุ"
                placeholder="อายุ"
                value={age}
                onChangeText={setAge}
                icon="calendar-outline"
            />

            <InputField
                label="เพศ"
                placeholder="เลือกเพศ"
                value={gender}
                onChangeText={setGender}
                isPicker={true}
                pickerItems={genders}
                icon="people-outline"
            />

            <InputField
                label="ที่อยู่"
                placeholder="ที่อยู่ปัจจุบัน"
                value={address}
                onChangeText={setAddress}
                icon="location-outline"
            />

            <StyledText className="text-lg font-semibold text-[#1e3a8a] mb-4 mt-6">
                ข้อมูลติดต่อฉุกเฉิน
            </StyledText>

            <InputField
                label="ชื่อผู้ติดต่อ"
                placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                value={emergencyName}
                onChangeText={setEmergencyName}
                icon="person-add-outline"
            />

            <InputField
                label="เบอร์โทรศัพท์"
                placeholder="เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน"
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
                <StyledText className="text-3xl font-bold text-[#1e3a8a] dark:text-white mb-2">
                    ยืนยันตัวตน
                </StyledText>
                <StyledText className="text-gray-500 dark:text-gray-400">
                    กรุณาถ่ายภาพเพื่อยืนยันตัวตน
                </StyledText>
            </StyledView>
    
            {/* ภาพถ่ายหน้าตรง */}
            <StyledView className="mb-8">
                <StyledText className="text-lg font-semibold text-[#1e3a8a] mb-4">
                    ภาพถ่ายหน้าตรง
                </StyledText>
                <TouchableOpacity
                    onPress={() => handleTakePhoto('selfie')}
                    className="bg-gray-100 p-6 rounded-2xl items-center border-2 border-dashed border-gray-300"
                >
                    {selfieImage ? (
                        <Image
                            source={{ uri: selfieImage }}
                            className="w-40 h-40 rounded-xl"
                        />
                    ) : (
                        <>
                            <Ionicons name="camera" size={40} color="#EB3834" />
                            <StyledText className="text-gray-500 mt-2">
                                แตะเพื่อถ่ายภาพหน้าตรง
                            </StyledText>
                        </>
                    )}
                </TouchableOpacity>
            </StyledView>
    
            {/* ภาพบัตรประชาชน */}
            <StyledView className="mb-8">
                <StyledText className="text-lg font-semibold text-[#1e3a8a] mb-4">
                    ภาพบัตรประชาชน
                </StyledText>
                <TouchableOpacity
                    onPress={() => handleTakePhoto('idCard')}
                    className="bg-gray-100 p-6 rounded-2xl items-center border-2 border-dashed border-gray-300"
                >
                    {idCardImage ? (
                        <Image
                            source={{ uri: idCardImage }}
                            className="w-40 h-40 rounded-xl"
                        />
                    ) : (
                        <>
                            <Ionicons name="card" size={40} color="#EB3834" />
                            <StyledText className="text-gray-500 mt-2">
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
                <StyledText className="text-3xl font-bold text-[#1e3a8a] dark:text-white mb-2">
                    ข้อมูลการเงิน
                </StyledText>
                <StyledText className="text-gray-500 dark:text-gray-400">
                    กรุณากรอกข้อมูลบัญชีธนาคารของคุณ
                </StyledText>
            </StyledView>
    
            <InputField
                label="ธนาคาร"
                placeholder="เลือกธนาคาร"
                value={bankName}
                onChangeText={setBankName}
                isPicker={true}
                pickerItems={banks}
                icon="business-outline"
            />
    
            <InputField
                label="เลขบัญชี"
                placeholder="กรอกเลขบัญชีธนาคาร"
                value={bankAccount}
                onChangeText={setBankAccount}
                icon="card-outline"
            />
    
            <StyledView className="bg-blue-50 p-4 rounded-xl mt-4">
                <StyledText className="text-sm text-gray-600">
                    <Ionicons name="information-circle" size={16} color="#1e3a8a" /> 
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
            <LinearGradient
                colors={['rgba(235, 56, 52, 0.1)', 'rgba(105, 20, 15, 0.05)']}
                className="absolute top-0 left-0 right-0 h-60 rounded-b-[40px]"
            />
    
            {/* Content */}
            <StyledView className="px-6 pt-8">
                {/* Success Animation */}
                <StyledView className="items-center mb-8">
                    <StyledView className="w-24 h-24 bg-white rounded-full shadow-lg items-center justify-center mb-4">
                        <LinearGradient
                            colors={['#EB3834', '#69140F']}
                            className="w-20 h-20 rounded-full items-center justify-center"
                        >
                            <Ionicons name="checkmark-sharp" size={40} color="white" />
                        </LinearGradient>
                    </StyledView>
                    
                    <StyledText className="text-3xl font-bold text-[#1e3a8a]">
                        ยินดีต้อนรับ!
                    </StyledText>
                    <StyledText className="text-gray-500 text-lg mt-2 text-center">
                        คุณได้เป็นส่วนหนึ่งของครอบครัว FriendsZone แล้ว
                    </StyledText>
                </StyledView>
    
                {/* Status Card */}
                <StyledView className="bg-white rounded-3xl p-6 shadow-md mb-6">
                    <StyledView className="flex-row items-center mb-4">
                        <StyledView className="w-2 h-2 rounded-full bg-[#EB3834] mr-2" />
                        <StyledText className="text-lg font-semibold text-[#1e3a8a]">
                            สถานะการลงทะเบียน
                        </StyledText>
                    </StyledView>
                    
                    <StyledView className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl">
                        <StyledView className="flex-row items-center">
                            <Ionicons name="time-outline" size={24} color="#EB3834" />
                            <StyledText className="ml-2 text-gray-600">
                                อยู่ระหว่างการตรวจสอบ
                            </StyledText>
                        </StyledView>
                        <StyledText className="text-[#EB3834] font-semibold">
                            3-7 วัน
                        </StyledText>
                    </StyledView>
                </StyledView>
    
                {/* What's Next Section */}
                <StyledView className="bg-white rounded-3xl p-6 shadow-md mb-6">
                    <StyledView className="flex-row items-center mb-4">
                        <StyledView className="w-2 h-2 rounded-full bg-[#EB3834] mr-2" />
                        <StyledText className="text-lg font-semibold text-[#1e3a8a]">
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
                                <Ionicons name={item.icon} size={20} color="#EB3834" />
                            </StyledView>
                            <StyledView className="flex-1 ml-4">
                                <StyledText className="font-semibold text-gray-800">
                                    {item.title}
                                </StyledText>
                                <StyledText className="text-gray-500">
                                    {item.description}
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    ))}
                </StyledView>
    
                {/* Slogan */}
                <StyledView className="items-center mb-8">
                    <LinearGradient
                        colors={['#EB3834', '#69140F']}
                        className="px-6 py-4 rounded-2xl"
                    >
                        <StyledText className="text-white text-lg font-semibold text-center">
                            "เพราะคำว่าเพื่อน สำคัญที่สุด"
                        </StyledText>
                    </LinearGradient>
                </StyledView>
            </StyledView>
        </ScrollView>
    );

    const renderFooterButton = () => (
        <StyledView className="px-6 py-4">
            <TouchableOpacity
                onPress={() => {
                    if (currentStep === 5) {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'HomeScreen' }],
                        });
                    } else {
                        handleNext();
                    }
                }}
                className="rounded-full overflow-hidden"
            >
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-4"
                >
                    <StyledText className="text-white text-center text-lg font-semibold">
                        {currentStep === 5 ? 'เริ่มต้นใช้งาน' : 'ถัดไป'}
                    </StyledText>
                </LinearGradient>
            </TouchableOpacity>
        </StyledView>
    );

    const handleNext = () => {
        if (currentStep < 5) {
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
                    <TouchableOpacity
                        onPress={handleBack}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <Ionicons name="arrow-back" size={24} color="#EB3834" />
                    </TouchableOpacity>
                    <StyledView className="flex-1 items-center">
                        <StyledText className="text-gray-500">
                            ขั้นตอนที่ {currentStep}/5
                        </StyledText>
                    </StyledView>
                    <StyledView className="w-10" />
                </StyledView>

                {/* Step Indicators */}
                <StyledView className="flex-row justify-between px-6 py-4">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <StyledView
                            key={step}
                            className={`h-1 flex-1 mx-1 rounded-full ${step <= currentStep ? 'bg-[#EB3834]' : 'bg-gray-200'
                                }`}
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
                        onPress={handleNext}
                        disabled={!acceptTerms}
                        className={`rounded-full overflow-hidden ${!acceptTerms ? 'opacity-50' : ''}`}
                    >
                        <LinearGradient
                            colors={['#EB3834', '#69140F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4"
                        >
                            <StyledText className="text-white text-center text-lg font-semibold">
                                {currentStep === 5 ? 'เสร็จสิ้น' : 'ถัดไป'}
                            </StyledText>
                        </LinearGradient>
                    </TouchableOpacity>
                </StyledView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}