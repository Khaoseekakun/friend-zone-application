import { SelectList } from 'react-native-dropdown-select-list';
import { RootStackParamList } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import React, { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
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
    Image,
    ScrollView,
} from 'react-native';

const { width } = Dimensions.get('screen');
const GRADIENT_COLORS = ['#ec4899', '#f97316'];

interface FormStepProps {
    currentStep: number;
    totalSteps: number;
    title: string;
}

// Styled Components
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Form Step Header Component
const FormStep: React.FC<FormStepProps> = ({ currentStep, totalSteps, title }) => (
    <StyledView className="items-center my-6">
        {/* Progress Steps */}
        <StyledView className="flex-row space-x-2 mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
                <LinearGradient
                    key={i}
                    colors={['#e5e7eb', '#e5e7eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-20 h-1 rounded-full"
                />
            ))}
        </StyledView>
        {/* Step Title */}
        <StyledText className="font-custom text-2xl font-bold text-gray-800 dark:text-white">
            {title}
        </StyledText>
    </StyledView>
);

// Input Field Component
const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    inputMode = 'text',
    secureTextEntry = false,
    editable = true,
    multiline = false,
    error = ''
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    inputMode?: 'text' | 'tel' | 'email' | 'numeric';
    secureTextEntry?: boolean;
    editable?: boolean;
    multiline?: boolean;
    error?: string;
}) => (
    <StyledView className="mb-4">
        <StyledText className="font-custom text-sm text-gray-700 dark:text-gray-300 mb-2">
            {label}
        </StyledText>
        <StyledTextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            inputMode={inputMode}
            secureTextEntry={secureTextEntry}
            editable={editable}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            className={`font-custom bg-white dark:bg-neutral-800 border ${
                error ? 'border-red-500' : 'border-gray-200 dark:border-neutral-700'
            } rounded-xl py-4 px-4 text-gray-800 dark:text-white ${
                multiline ? 'h-32' : 'h-[52px]'
            }`}
        />
        {error ? (
            <StyledText className="text-red-500 text-sm mt-1 font-custom">
                {error}
            </StyledText>
        ) : null}
    </StyledView>
);

// Selection Button Component
const SelectionButton = ({
    label,
    selected,
    onPress
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) => (
    <StyledTouchableOpacity
        onPress={onPress}
        className="mb-2"
    >
        <LinearGradient
            colors={['#FFFFFF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={`rounded-xl ${
                !selected ? 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700' : ''
            }`}
        >
            <StyledText className={`font-custom py-4 px-4 ${
                selected ? 'text-white' : 'text-gray-800 dark:text-white'
            }`}>
                {label}
            </StyledText>
        </LinearGradient>
    </StyledTouchableOpacity>
);

const ImageUpload = ({
    title,
    image,
    onUpload,
    onDelete,
    icon,
}: {
    title: string;
    image: string | null;
    onUpload: () => void;
    onDelete: () => void;
    icon: keyof typeof Ionicons.glyphMap;
}) => (
    <StyledView className="mb-6">
        <StyledText className="font-custom text-base text-gray-800 dark:text-white mb-2">
            {title}
        </StyledText>
        {image ? (
            <StyledView className="relative">
                <Image
                    source={{ uri: image }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                />
                <StyledTouchableOpacity
                    onPress={onDelete}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                >
                    <Ionicons name="close" size={20} color="white" />
                </StyledTouchableOpacity>
            </StyledView>
        ) : (
            <StyledTouchableOpacity
                onPress={onUpload}
                className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-6 items-center bg-gray-50 dark:bg-neutral-800"
            >
                <Ionicons 
                    name={icon} 
                    size={40} 
                    color={Platform.OS === 'ios' ? '#9ca3af' : '#fff'} 
                />
                <StyledText className="text-gray-500 dark:text-gray-400 font-custom mt-2 text-center">
                    {title}
                </StyledText>
            </StyledTouchableOpacity>
        )}
    </StyledView>
);

// Main Component
export default function MemberRegistration() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [step, setStep] = useState(1);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Personal Information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    // Identity Verification
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [idCardImage, setIdCardImage] = useState<string | null>(null);

    // Banking Information
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    // Constants
    const banks = [
        'ธนาคารกสิกรไทย',
        'ธนาคารไทยพาณิชย์',
        'ธนาคารกรุงเทพ',
        'ธนาคารกรุงไทย',
        'ธนาคารกรุงศรีอยุธยา'
    ];

    // Animation Handlers
    const handleNext = () => {
        if (step < 3) {
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setStep(prev => prev + 1);
                slideAnim.setValue(0);
            });
        }
    };

    const handleBack = () => {
        if (step > 1) {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setStep(prev => prev - 1);
                slideAnim.setValue(0);
            });
        } else {
            navigation.goBack();
        }
    };

    // Image Picker
    const pickImage = async (setImage: (value: string | null) => void) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setImage(result.assets[0].uri);
        }
    };

    // Step Content Renderers
    const renderPersonalInfo = () => (
        <StyledScrollView 
            showsVerticalScrollIndicator={false}
            className="flex-1"
        >
            <StyledView className="space-y-2">
                <InputField
                    label="ชื่อจริง"
                    placeholder="ชื่อจริง"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <InputField
                    label="นามสกุล"
                    placeholder="นามสกุล"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <InputField
                    label="อายุ"
                    placeholder="อายุ"
                    value={age}
                    onChangeText={setAge}
                    inputMode="numeric"
                />
                <InputField
                    label="ที่อยู่"
                    placeholder="ที่อยู่"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                />

                <StyledView className="mb-4">
                    <StyledText className="font-custom text-sm text-gray-700 dark:text-gray-300 mb-2">
                        เพศ
                    </StyledText>
                    <SelectList
                        setSelected={setGender}
                        data={[
                            {key: 'ชาย', value: 'ชาย'},
                            {key: 'หญิง', value: 'หญิง'},
                            {key: 'ไม่ระบุเพศ', value: 'ไม่ระบุเพศ'}
                        ]}
                        placeholder="เลือกเพศ"
                        boxStyles={{
                            backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : '#1f1f1f',
                            borderRadius: 12,
                            borderColor: Platform.OS === 'ios' ? '#e5e7eb' : '#404040',
                        }}
                        inputStyles={{
                            color: Platform.OS === 'ios' ? '#1f2937' : '#ffffff',
                        }}
                    />
                </StyledView>

                <InputField
                    label="เบอร์โทรฉุกเฉิน"
                    placeholder="เบอร์โทรศัพท์"
                    value={emergencyPhone}
                    onChangeText={setEmergencyPhone}
                    inputMode="tel"
                />
            </StyledView>
        </StyledScrollView>
    );

    const renderIdentityVerification = () => (
        <StyledScrollView 
            showsVerticalScrollIndicator={false}
            className="flex-1"
        >
            <ImageUpload
                title="อัพโหลดรูปภาพหน้าตรง"
                image={selfieImage}
                onUpload={() => pickImage(setSelfieImage)}
                onDelete={() => setSelfieImage(null)}
                icon="camera-outline"
            />
            <ImageUpload
                title="อัพโหลดรูปภาพบัตรประชาชน"
                image={idCardImage}
                onUpload={() => pickImage(setIdCardImage)}
                onDelete={() => setIdCardImage(null)}
                icon="card-outline"
            />
        </StyledScrollView>
    );

    const renderBankingInfo = () => (
        <StyledScrollView 
            showsVerticalScrollIndicator={false}
            className="flex-1"
        >
            <StyledView className="mb-6">

                <StyledView className="mb-4">
                    <StyledText className="font-custom text-sm text-gray-700 dark:text-gray-300 mb-2">
                        ธนาคาร
                    </StyledText>
                    <SelectList
                        setSelected={setGender}
                        data={[
                            { key: 'ธนาคารกสิกรไทย', value: 'ธนาคารกสิกรไทย' },
                            { key: 'ธนาคารไทยพาณิชย์', value: 'ธนาคารไทยพาณิชย์' },
                            { key: 'ธนาคารกรุงเทพ', value: 'ธนาคารกรุงเทพ' },
                            { key: 'ธนาคารกรุงไทย', value: 'ธนาคารกรุงไทย' },
                            { key: 'ธนาคารกรุงศรีอยุธยา', value: 'ธนาคารกรุงศรีอยุธยา' },
                        ]}                        
                        placeholder="เลือกธนาคาร"
                        boxStyles={{
                            backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : '#1f1f1f',
                            borderRadius: 12,
                            borderColor: Platform.OS === 'ios' ? '#e5e7eb' : '#404040',
                        }}
                        inputStyles={{
                            color: Platform.OS === 'ios' ? '#1f2937' : '#ffffff',
                        }}
                    />
                </StyledView>
            </StyledView>

            <InputField
                label="เลขบัญชีธนาคาร"
                placeholder="เลขบัญชี"
                value={accountNumber}
                onChangeText={setAccountNumber}
                inputMode="numeric"
            />

            <InputField
                label="ชื่อบัญชี"
                placeholder="ชื่อบัญชี"
                value={accountName}
                onChangeText={setAccountName}
            />
        </StyledScrollView>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <StyledView className="flex-1 bg-white dark:bg-neutral-900">
                <StyledView className="flex-1 px-6 pt-12">
                    {/* Header Back Button */}
                    <StyledTouchableOpacity 
                        onPress={handleBack} 
                        className="mt-6"
                    >
                        <LinearGradient
                            colors={GRADIENT_COLORS as ['#ec4899', '#f97316']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="w-10 h-10 rounded-full items-center justify-center"
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </LinearGradient>
                    </StyledTouchableOpacity>

                    {/* Step Indicator and Title */}
                    <FormStep
                        currentStep={step}
                        totalSteps={3}
                        title={
                            step === 1 ? 'ข้อมูลส่วนตัว' :
                            step === 2 ? 'ยืนยันตัวตน' :
                            'ข้อมูลการเงิน'
                        }
                    />

                    {/* Form Content */}
                    <Animated.View 
                        style={{
                            transform: [{ translateX: slideAnim }],
                            flex: 1,
                            marginBottom: 16
                        }}
                    >
                        {/* Render Different Steps */}
                        {step === 1 ? renderPersonalInfo() :
                         step === 2 ? renderIdentityVerification() :
                         renderBankingInfo()}
                    </Animated.View>

                    {/* Bottom Button */}
                    <StyledView className="py-4">
                        <StyledTouchableOpacity
                            onPress={() => {
                                if (step === 3) {
                                    // Handle final submission
                                    const formData = {
                                        personalInfo: {
                                            firstName,
                                            lastName,
                                            age,
                                            address,
                                            gender,
                                            emergencyPhone
                                        },
                                        identityVerification: {
                                            selfieImage,
                                            idCardImage
                                        },
                                        bankingInfo: {
                                            bankName,
                                            accountNumber,
                                            accountName
                                        }
                                    };
                                    console.log('Submit form data:', formData);
                                    // Add your submission logic here
                                } else {
                                    handleNext();
                                }
                            }}
                        >
                            <LinearGradient
                                colors={GRADIENT_COLORS as ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-full py-4 shadow-sm"
                            >
                                <StyledText className="text-white text-center font-custom text-lg font-semibold">
                                    {step === 3 ? 'ยืนยันข้อมูล' : 'ถัดไป'}
                                </StyledText>
                            </LinearGradient>
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>
            </StyledView>
        </TouchableWithoutFeedback>
    );
}