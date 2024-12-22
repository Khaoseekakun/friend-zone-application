// ไม่แน่ใจว่ามึงแฮสรหัสอะมั้ย เพราะมันเปลี่ยนไม่ได้

import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView, Alert, Modal, FlatList } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import { API_SYSTEM_KEY } from "../../components/config";

interface UserProfile {
    id: string;
    username?: string;
    bio?: string;
    education?: string;
    location?: string;
    height?: number;
    weight?: number;
    services?: string[];
    previewAllImageUrl?: string[];
    phoneNumber?: string;
    gmail?: string;
    firstname?: string;
    lastname?: string;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledIonicons = styled(Ionicons);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const GRADIENT_START = '#ec4899';
const GRADIENT_END = '#f97316';

// Add this constant for bank options
const BANK_OPTIONS = [
    "ธนาคารกสิกรไทย",
    "ธนาคารกรุงเทพ",
    "ธนาคารไทยพาณิชย์",
    "ธนาคารกรุงไทย",
    "ธนาคารกรุงศรีอยุธยา",
    "ธนาคารทหารไทยธนชาต",
    "ธนาคารออมสิน",
    "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร"
];

// Components for each section
const EmailSection = ({ email, setEmail, onSave, step, setStep, newEmail, setNewEmail }: {
    email: string,
    setEmail: (email: string) => void,
    onSave: () => void,
    step: number,
    setStep: (step: number) => void,
    newEmail: string,
    setNewEmail: (email: string) => void
}) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (
        step: number,
    ) => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const response = await axios.post('https://friendszone.app/api/email/otp',
                { email: step === 2 ? email : newEmail },
                {
                    headers: {
                        "Authorization": `System ${API_SYSTEM_KEY}`
                    }
                }
            );
            // console.log(response.data);

            if (response.data.status === 200) {
                setStep(step);
            } else {
                console.log(response.data);
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถส่งรหัส OTP ได้");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (
        submit = false
    ) => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const response = await axios.put('https://friendszone.app/api/email/otp',
                {
                    email: submit == true ? newEmail : email,
                    otp
                },
                {
                    headers: {
                        "Authorization": `System ${API_SYSTEM_KEY}`
                    }
                }
            );

            if (response.data.status === 200) {
                if (submit == true) {
                    handleUpdateEmail();
                } else {
                    setStep(3);
                }
            } else {
                console.log(response.data);
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "รหัส OTP ไม่ถูกต้อง");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const response = await axios.put('https://friendszone.app/api/email',
                {
                    oldEmail: email,
                    newEmail: newEmail,
                    accountType: 'member'
                },
                {
                    headers: {
                        "Authorization": `System ${API_SYSTEM_KEY}`
                    }
                }
            );

            if (response.data.data.code === "EMAIL_EXISTS") {
                Alert.alert("ข้อผิดพลาด", "อีเมลนี้มีอยู่ในระบบแล้ว");
                return;
            }

            if (response.data.status === 200) {
                Alert.alert("สำเร็จ", "อัพเดทอีเมลเรียบร้อยแล้ว");
                onSave();
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถอัพเดทอีเมลได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledView className="flex-1 px-4">
            {step === 1 && (
                <>
                    <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2 mt-4">เปลี่ยนอีเมล</StyledText>
                    <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกอีเมลที่ใช้งานปัจจุบัน เพื่อรับรหัส OTP</StyledText>
                    <StyledView className="w-full mb-6">
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            อีเมลปัจจุบัน
                        </StyledText>
                        <StyledInput
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mb-2"
                            placeholder="อีเมล"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            editable={false}
                        />
                    </StyledView>
                    <GradientButton
                        title={loading ? "กำลังส่งรหัส..." : "ส่งรหัส OTP"}
                        onPress={(() => { handleSendOTP(2) })}
                    />
                </>
            )}

            {step === 2 && (
                <>
                    <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">ยืนยันรหัส OTP</StyledText>
                    <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ</StyledText>
                    <StyledView className="w-full mb-6">
                        <StyledInput
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full text-center text-xl tracking-widest"
                            placeholder="_ _ _ _ _ _"
                            maxLength={6}
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                        />
                    </StyledView>
                    <GradientButton
                        title={loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                        onPress={handleVerifyOTP}
                    />
                </>
            )}

            {step === 3 && (
                <>
                    <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2 mt-4">กรอกอีเมลใหม่</StyledText>
                    <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกอีเมลใหม่ที่ต้องการเปลี่ยน</StyledText>
                    <StyledView className="w-full mb-6">
                        <StyledInput
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mb-2"
                            placeholderTextColor="#666"
                            placeholder="กรอกอีเมลใหม่ของคุณ"
                            value={newEmail}
                            onChangeText={setNewEmail}
                        />
                    </StyledView>
                    <GradientButton
                        title={loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                        onPress={(() => { handleSendOTP(4) })}
                    />
                </>
            )}

            {step === 4 && (
                <>
                    <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">ยืนยันรหัส OTP อีเมลใหม่</StyledText>
                    <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลใหม่ของคุณ</StyledText>
                    <StyledView className="w-full mb-6">
                        <StyledInput
                            className="font-custom border border-gray-300 rounded-full py-4 px-4 text-gray-600 dark:text-gray-200 w-full text-center text-xl tracking-widest"
                            placeholder="_ _ _ _ _ _"
                            maxLength={6}
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                        />
                    </StyledView>
                    <GradientButton
                        title={loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
                        onPress={(() => { handleVerifyOTP(true) })}
                    />
                </>
            )}
        </StyledView>
    );
};

const PasswordSection = ({
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    onSave
}: {
    currentPassword: string,
    setCurrentPassword: (password: string) => void,
    newPassword: string,
    setNewPassword: (password: string) => void,
    confirmPassword: string,
    setConfirmPassword: (password: string) => void,
    onSave: () => void
}) => {
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdatePassword = async () => {
        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน");
                return;
            }

            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;
            const userList = JSON.parse(userData);
            // Update password


            if (newPassword.length < 8) {
                Alert.alert("ข้อผิดพลาด", "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
                return;
            }

            if (newPassword === currentPassword) {
                Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่สามารถเหมือนกับรหัสผ่านปัจจุบันได้");
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน");
                return;
            }

            const updateResponse = await axios.put('https://friendszone.app/api/oauth/password',
                {
                    email: userList.email,
                    oldPassword: currentPassword,
                    newPassword: newPassword
                },
                {
                    headers: {
                        "Authorization": `System ${API_SYSTEM_KEY}`
                    }
                }
            );

            if (updateResponse.data.status === 200) {
                Alert.alert("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onSave();
            } else {
                if (updateResponse.data.data.code == "WRONG_PASSWORD") {
                    Alert.alert("ข้อผิดพลาด", "รหัสผ่านปัจจุบันไม่ถูกต้อง");
                }
                else if (updateResponse.data.data.code == "USER_NOT_FOUND") {
                    Alert.alert("ข้อผิดพลาด", "ไม่พบผู้ใช้งาน");
                }
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถเปลี่ยนรหัสผ่านได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledView className="flex-1 px-4">
            <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2 mt-4">เปลี่ยนรหัสผ่าน</StyledText>
            <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่</StyledText>
            <StyledView className="w-full mb-6">
                <StyledText className="font-custom text-neutral-400 text-base mb-2">
                    รหัสผ่านปัจจุบัน
                </StyledText>
                <StyledView className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl mb-2 px-4 py-1">
                    <StyledInput
                        className="flex-1 dark:text-white font-custom text-lg"
                        placeholder="รหัสผ่านปัจจุบัน"
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        <StyledIonicons name={showCurrentPassword ? "eye-off" : "eye"} size={24} className="text-gray-500" />
                    </TouchableOpacity>
                </StyledView>

                <StyledText className="font-custom text-neutral-400 text-base mb-2">
                    รหัสผ่านใหม่
                </StyledText>
                <StyledView className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl mb-2 px-4 py-1">
                    <StyledInput
                        className="flex-1 dark:text-white font-custom text-lg"
                        placeholder="รหัสผ่านใหม่"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <StyledIonicons name={showNewPassword ? "eye-off" : "eye"} size={24} className="text-gray-500" />
                    </TouchableOpacity>
                </StyledView>

                <StyledText className="font-custom text-neutral-400 text-base mb-2">
                    ยืนยันรหัสผ่านใหม่
                </StyledText>
                <StyledView className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl mb-2 px-4 py-1">
                    <StyledInput
                        className="flex-1 dark:text-white font-custom text-lg"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <StyledIonicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} className="text-gray-500" />
                    </TouchableOpacity>
                </StyledView>
            </StyledView>
            <GradientButton
                title={loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                onPress={handleUpdatePassword}
            />
        </StyledView>
    );
};

const BankSection = ({
    profileData,
    setBankAccount,
    bankNo,
    bankAccount,
    bankName,
    setBankName,
    onSave
}: {
    profileData: UserProfile | null,
    setBankAccount: (account: string) => void,
    bankAccount: string,
    bankName: string,
    bankNo: string,
    setBankName: (name: string) => void,
    onSave: () => void
}) => {
    const [showBankPicker, setShowBankPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [accountNo, setAccountNo] = useState(bankNo);
    const [accountName, setAccountName] = useState(bankAccount);



    const handleSave = async () => {
        try {
            if (!accountNo || !bankName || !accountName) {
                Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลธนาคารให้ครบถ้วน");
                return;
            }

            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;
            const userList = JSON.parse(userData);

            const response = await axios.put(
                `https://friendszone.app/api/member/${userList.id}/transaction`,
                {
                    bankName,
                    accountNo,
                    accountName
                },
                {
                    headers: {
                        "Authorization": `System ${API_SYSTEM_KEY}`
                    }
                }
            );
            // console.log('response.data : ', response.data);
            // response.data :  {"data": {"code": "BAD_REQUEST", "message": "Invalid request"}, "status": 500}

            if (response.data.status === 200) {
                Alert.alert("สำเร็จ", "บันทึกข้อมูลธนาคารเรียบร้อยแล้ว");
                onSave();
            } else {
                if (response.data.data.code == "MEMBER_NOT_FOUND") {
                    Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลสมาชิก");
                }
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลธนาคารได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledView className="flex-1 px-4">
            <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2 mt-4">บัญชีธนาคาร</StyledText>
            <StyledText className="text-base text-gray-400 mb-6 font-custom">กรุณากรอกข้อมูลบัญชีธนาคารของคุณ</StyledText>
            <StyledView className="w-full mb-6">
                <StyledInput
                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mb-4"
                    placeholder="ชื่อบัญชีธนาคาร"
                    value={accountName ? accountName : bankAccount}
                    onChangeText={setAccountName}
                    placeholderTextColor="#666"
                />
                <StyledInput
                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mb-4"
                    placeholder="เลขบัญชีธนาคาร"
                    value={accountNo ? accountNo : bankNo}
                    onChangeText={setAccountNo}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                />

                <TouchableOpacity
                    onPress={() => setShowBankPicker(true)}
                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 mb-4"
                >
                    <StyledText className={`font-custom ${bankName ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                        {bankName || "เลือกธนาคาร"}
                    </StyledText>
                </TouchableOpacity>
            </StyledView>

            <Modal
                visible={showBankPicker}
                transparent={true}
                animationType="slide"
            >
                <StyledView className="flex-1 justify-end bg-black/50">
                    <StyledView className="bg-white dark:bg-neutral-900 rounded-t-3xl">
                        <StyledView className="p-4 border-b border-gray-200 dark:border-neutral-800 flex-row justify-between items-center">
                            <StyledText className="font-custom text-lg dark:text-white">เลือกธนาคาร</StyledText>
                            <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                                <StyledText className="font-custom text-pink-500">ปิด</StyledText>
                            </TouchableOpacity>
                        </StyledView>
                        <FlatList
                            data={BANK_OPTIONS}
                            className="max-h-80"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setBankName(item);
                                        setShowBankPicker(false);
                                    }}
                                    className="p-4 border-b border-gray-100 dark:border-neutral-800"
                                >
                                    <StyledText className="font-custom dark:text-white">{item}</StyledText>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item}
                        />
                    </StyledView>
                </StyledView>
            </Modal>

            <GradientButton
                title={loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                onPress={handleSave}
            />
        </StyledView>
    );
};

const GradientButton = ({ onPress, title }: { onPress: () => void, title: string }) => (
    <TouchableOpacity onPress={onPress}>
        <LinearGradient
            colors={[GRADIENT_START, GRADIENT_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl p-3 mt-2"
        >
            <StyledText className="text-white text-center font-custom">
                {title}
            </StyledText>
        </LinearGradient>
    </TouchableOpacity>
);

export default function SettingSecurity() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankNo, setBankNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<'main' | 'email' | 'password' | 'bank'>('main');
    const isFoucs = useIsFocused();

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            const response = await axios.get<{ status: number; data: { profile: UserProfile } }>(
                `https://friendszone.app/api/profile/${userList.id}`,
                {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                }
            );

            if (response.data.status === 200) {
                const profileData = response.data.data.profile;
                setProfile(profileData);
                // console.log(profileData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFoucs == true) {
            if (profile?.gmail) {
                setEmail(profile.gmail);
            }
            if (profile?.BankAccount.length > 0) {
                setBankAccount(profile.BankAccount[0].accountName);
                setBankName(profile.BankAccount[0].bankName);
                setBankNo(profile.BankAccount[0].accountNo);
            }
            fetchUserData();
            setStep(1);
        }
    }, [isFoucs]);

    const updateEmail = async () => {
        if (!email) {
            Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมล");
            return;
        }
        setActiveSection('main');
    };

    const updatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }
        setActiveSection('main');
    };

    const updateBankInfo = async () => {
        if (!bankAccount || !bankName) {
            Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลธนาคารให้ครบถ้วน");
            return;
        }
        setActiveSection('main');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'email':
                return <EmailSection
                    email={email}
                    setEmail={setEmail}
                    onSave={updateEmail}
                    step={step}
                    setStep={setStep}
                    newEmail={newEmail}
                    setNewEmail={setNewEmail}
                />;
            case 'password':
                return <PasswordSection
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    onSave={updatePassword}
                />;
            case 'bank':
                return <BankSection
                    profileData={profile}
                    setBankAccount={setBankAccount}
                    bankName={bankName}
                    bankNo={bankNo}
                    bankAccount={bankAccount}
                    setBankName={setBankName}
                    onSave={updateBankInfo}
                />;
            default:
                return (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <StyledView className="px-4 py-4 space-y-6">
                            {/* การเข้าถึงบัญชี */}
                            <StyledView>
                                <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">
                                    การเข้าถึงบัญชี
                                </StyledText>

                                {/* Email */}
                                <TouchableOpacity
                                    className="bg-white dark:bg-neutral-800 rounded-xl mb-3"
                                    onPress={() => setActiveSection('email')}
                                >
                                    <StyledView className="flex-row items-center p-4 border-l-4 border-blue-500">
                                        <StyledView className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                                            <StyledIonicons name="mail-outline" size={24} className="text-blue-500" />
                                        </StyledView>
                                        <StyledView className="flex-1 ml-3">
                                            <StyledText className="text-base dark:text-white font-custom">
                                                เปลี่ยนอีเมล
                                            </StyledText>
                                            <StyledText className="text-xs text-neutral-400 dark:text-neutral-500 font-custom">
                                                {email || "ยังไม่ได้ตั้งค่าอีเมล"}
                                            </StyledText>
                                        </StyledView>
                                        <StyledIonicons name="chevron-forward" size={24} className="text-neutral-400" />
                                    </StyledView>
                                </TouchableOpacity>

                                {/* Password */}
                                <TouchableOpacity
                                    className="bg-white dark:bg-neutral-800 rounded-xl mb-3"
                                    onPress={() => setActiveSection('password')}
                                >
                                    <StyledView className="flex-row items-center p-4 border-l-4 border-red-500">
                                        <StyledView className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center">
                                            <StyledIonicons name="lock-closed-outline" size={24} className="text-red-500" />
                                        </StyledView>
                                        <StyledView className="flex-1 ml-3">
                                            <StyledText className="text-base dark:text-white font-custom">
                                                เปลี่ยนรหัสผ่าน
                                            </StyledText>
                                            <StyledText className="text-xs text-neutral-400 dark:text-neutral-500 font-custom">
                                                แตะเพื่อเปลี่ยนรหัสผ่านของคุณ
                                            </StyledText>
                                        </StyledView>
                                        <StyledIonicons name="chevron-forward" size={24} className="text-neutral-400" />
                                    </StyledView>
                                </TouchableOpacity>
                            </StyledView>

                            {/* ข้อมูลการเงิน */}
                            {
                                profile?.type === 'member' && (
                                    <StyledView>
                                        <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">
                                            ข้อมูลการเงิน
                                        </StyledText>

                                        {/* Bank Account */}
                                        <TouchableOpacity
                                            className="bg-white dark:bg-neutral-800 rounded-xl"
                                            onPress={() => setActiveSection('bank')}
                                        >
                                            <StyledView className="flex-row items-center p-4 border-l-4 border-green-500">
                                                <StyledView className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center">
                                                    <StyledIonicons name="card-outline" size={24} className="text-green-500" />
                                                </StyledView>
                                                <StyledView className="flex-1 ml-3">
                                                    <StyledText className="text-base dark:text-white font-custom">
                                                        บัญชีธนาคาร
                                                    </StyledText>
                                                    <StyledText className="text-xs text-neutral-400 dark:text-neutral-500 font-custom">
                                                        เพิ่มหรือแก้ไขบัญชีธนาคารของคุณ
                                                    </StyledText>
                                                </StyledView>
                                                <StyledIonicons name="chevron-forward" size={24} className="text-neutral-400" />
                                            </StyledView>
                                        </TouchableOpacity>
                                    </StyledView>
                                )
                            }

                            {/* Phone Number */}
                            <StyledView>
                                <StyledText className="text-2xl font-custom text-[#1e3a8a] dark:text-[#f0f5ff] mb-2">
                                    ข้อมูลการติดต่อ
                                </StyledText>

                                <StyledView className="bg-white dark:bg-neutral-800 rounded-xl">
                                    <StyledView className="flex-row items-center p-4 border-l-4 border-yellow-500">
                                        <StyledView className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full items-center justify-center">
                                            <StyledIonicons name="phone-portrait-outline" size={24} className="text-yellow-500" />
                                        </StyledView>
                                        <StyledView className="flex-1 ml-3">
                                            <StyledText className="text-base dark:text-white font-custom">
                                                เบอร์โทรศัพท์
                                            </StyledText>
                                            <StyledText className="text-xs text-neutral-400 dark:text-neutral-500 font-custom">
                                                {profile?.phoneNumber || "-"}
                                            </StyledText>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </ScrollView>
                );
        }
    };

    return (
        <StyledKeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-gray-100 dark:bg-neutral-950"
        >
            <StyledView className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS === "ios" ? "mt-8" : "mt-8"} ${Platform.OS === "ios" ? "h-[80px]" : "h-[80px]"}`}>
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => {
                        if (activeSection === 'main') {
                            navigation.navigate('SettingTab', {});
                        } else {
                            setActiveSection('main');
                        }
                    }}
                >
                    <StyledText className="font-custom text-gray-500 dark:text-white text-lg">
                        {activeSection === 'main' ? 'กลับ' : 'ยกเลิก'}
                    </StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white text-lg font-custom">
                    การตั้งค่าความปลอดภัย
                </StyledText>
            </StyledView>

            {renderContent()}
        </StyledKeyboardAvoidingView>
    );
}