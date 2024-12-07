import { RootStackParamList } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import React, { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';

const { width } = Dimensions.get('screen');

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  inputMode?: 'text' | 'tel' | 'email';
  secureTextEntry?: boolean;
  editable?: boolean;
  wrong?: boolean;
  onBlur?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  inputMode = 'text',
  secureTextEntry = false,
  editable = true,
  wrong = false,
  onBlur
}) => (
  <StyledView className="w-full mb-7">
    <StyledText className={`font-custom text-sm ${wrong ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} mb-2 ml-4 absolute -mt-3 bg-white dark:bg-neutral-900 z-50 px-2`}>
      {label}
    </StyledText>
    <StyledView className="font-custom w-full relative">
      <StyledTextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        inputMode={inputMode}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onBlur={onBlur}
        className={`font-custom border ${wrong ? 'border-red-500' : 'border-gray-300'} rounded-full py-4 px-4 ${wrong ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} w-full`}
        placeholderTextColor="#9CA3AF"
      />
    </StyledView>
  </StyledView>
);

export default function RegisterMember() {
    const [step, setStep] = useState(1);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Step 1 data
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneVerify, setPhoneVerify] = useState(false);
    const [getOtp, setGetOtp] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false as boolean | null);

    // Step 2 data
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleNext = () => {
        if (step === 1) {
            if (!username || !password || !email || !phone || !phoneVerify) {
                Animated.sequence([
                    ...Array(3).fill(null).map(() => (
                        Animated.sequence([
                            Animated.timing(slideAnim, {
                                toValue: -10,
                                duration: 50,
                                useNativeDriver: true
                            }),
                            Animated.timing(slideAnim, {
                                toValue: 10,
                                duration: 50,
                                useNativeDriver: true
                            })
                        ])
                    )),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 50,
                        useNativeDriver: true
                    })
                ]).start();
                return;
            }
        }

        if (step < 2) {
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setStep(step + 1);
            });
        }
    };

    const handleBack = () => {
        if (step > 1) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setStep(step - 1);
            });
        } else {
            navigation.goBack();
        }
    };

    const onCheckUsername = (value: string) => {
        const englishRegex = /^[A-Za-z0-9_]*$/;
        setIsUsernameValid(null);
        if (!englishRegex.test(value)) {
            setUsername(value.slice(0, -1));
            return;
        } else {
            setUsername(value);
        }
    };

    return (
        <StyledTouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <StyledView className="flex-1 bg-white dark:bg-neutral-900 h-full pt-[20%]">
                <StyledView className="flex-1 px-6">
                    <TouchableOpacity onPress={handleBack} className="mt-6">
                        <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
                    </TouchableOpacity>

                    <StyledView className="flex items-center">
                        <StyledText className="font-custom text-3xl font-bold text-[#1e3a8a] mt-6 mb-2">
                            สร้างบัญชี
                        </StyledText>
                        <StyledText className="font-custom text-base text-gray-400">
                            {step === 1 ? 'สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน' : 'ข้อมูลส่วนตัวของสมาชิก'}
                        </StyledText>
                    </StyledView>

                    <Animated.View 
                        style={{
                            transform: [{ translateX: slideAnim }],
                            flex: 1,
                            marginTop: 32
                        }}
                    >
                        {step === 1 ? (
                            <StyledView className="space-y-6">
                                <InputField
                                    label="ชื่อผู้ใช้"
                                    placeholder="ชื่อผู้ใช้ของคุณ"
                                    value={username}
                                    onChangeText={onCheckUsername}
                                    wrong={isUsernameValid !== null && isUsernameValid}
                                />
                                <InputField
                                    label="รหัสผ่าน"
                                    placeholder="รหัสผ่าน"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <InputField
                                    label="อีเมล"
                                    placeholder="อีเมล"
                                    value={email}
                                    onChangeText={setEmail}
                                    inputMode="email"
                                />
                                <InputField
                                    label="เบอร์โทรศัพท์"
                                    placeholder="เบอร์โทรศัพท์"
                                    value={phone}
                                    onChangeText={setPhone}
                                    inputMode="tel"
                                />

                                {phone.length === 10 && !phoneVerify && (
                                    <StyledView className="mt-4">
                                        {getOtp ? (
                                            <StyledView className="flex-row space-x-2">
                                                <StyledView className="flex-1">
                                                    <InputField
                                                        label="รหัส OTP"
                                                        placeholder="กรอกรหัส OTP"
                                                        value={otp}
                                                        onChangeText={setOtp}
                                                        inputMode="numeric"
                                                    />
                                                </StyledView>
                                                <TouchableOpacity
                                                    onPress={() => setPhoneVerify(true)}
                                                    className="bg-[#1e3a8a] h-12 px-4 rounded-xl self-end"
                                                >
                                                    <StyledText className="text-white font-custom text-center my-auto">
                                                        ยืนยัน
                                                    </StyledText>
                                                </TouchableOpacity>
                                            </StyledView>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => setGetOtp(true)}
                                                className="bg-[#1e3a8a] py-3 rounded-xl"
                                            >
                                                <StyledText className="text-white font-custom text-center">
                                                    ยืนยันเบอร์โทรศัพท์
                                                </StyledText>
                                            </TouchableOpacity>
                                        )}
                                    </StyledView>
                                )}
                            </StyledView>
                        ) : (
                            <StyledView className="space-y-6">
                                <StyledView className="flex-row space-x-4">
                                    <StyledView className="flex-1">
                                        <InputField
                                            label="ชื่อจริง"
                                            placeholder="ชื่อจริง"
                                            value={firstName}
                                            onChangeText={setFirstName}
                                        />
                                    </StyledView>
                                    <StyledView className="flex-1">
                                        <InputField
                                            label="นามสกุล"
                                            placeholder="นามสกุล"
                                            value={lastName}
                                            onChangeText={setLastName}
                                        />
                                    </StyledView>
                                </StyledView>
                                <InputField
                                    label="การติดต่อฉุกเฉิน"
                                    placeholder="เบอร์โทรศัพท์"
                                    value={emergencyContact}
                                    onChangeText={setEmergencyContact}
                                    inputMode="tel"
                                />
                                <InputField
                                    label="วันเกิด"
                                    placeholder="เลือกวันเกิด"
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                    editable={false}
                                />
                            </StyledView>
                        )}

                        <TouchableOpacity 
                            onPress={handleNext}
                            disabled={step === 1 && (!username || !password || !email || !phone || !phoneVerify)}
                            className="w-full mt-6"
                        >
                            <LinearGradient
                                colors={step === 1 && (!username || !password || !email || !phone || !phoneVerify) 
                                    ? ['#ccc', '#ccc'] 
                                    : ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-3 shadow-sm"
                            >
                                <StyledText className="font-custom text-center text-white text-lg font-semibold">
                                    {step === 1 ? 'ถัดไป' : 'สร้างบัญชี'}
                                </StyledText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </StyledView>
            </StyledView>
        </StyledTouchableWithoutFeedback>
    );
}