import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View, SafeAreaView, Platform, Appearance, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AccountStatus() {
    const navigation = useNavigation();
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [accountType, setAccountType] = useState('pending'); // 'customer', 'member', 'pending'

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, []);

    return (
        <StyledSafeAreaView className="flex-1 bg-gray-100 dark:bg-neutral-950">
            <StyledView className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS === "ios" ? "h-[50px]" : "h-[103px]"}`}>
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => navigation.goBack()}
                >
                    <StyledText className="font-custom text-gray-500 dark:text-white text-lg mt-6">
                        กลับ
                    </StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white text-lg font-custom mt-6">
                    สถานะบัญชี
                </StyledText>
            </StyledView>

            <StyledScrollView className="flex-1 px-4">
                <StyledView className="mt-4 space-y-4">
                    {/* สถานะบัญชี */}
                    <StyledView className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                        <LinearGradient
                            colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                            className="w-16 h-16 rounded-full items-center justify-center mb-4 self-center"
                        >
                            <StyledIonIcon name="person" size={32} color="white" />
                        </LinearGradient>
                        
                        <StyledText className="font-custom text-xl text-center text-neutral-800 dark:text-white mb-2">
                            {accountType === 'member' ? 'สมาชิก' : 
                             accountType === 'pending' ? 'กำลังตรวจสอบ' : 'ลูกค้า'}
                        </StyledText>
                        
                        <StyledText className="font-custom text-center text-neutral-500 dark:text-neutral-400 mb-6">
                            {accountType === 'member' ? 'บัญชีสมาชิกที่ได้รับการยืนยันแล้ว' :
                             accountType === 'pending' ? 'อยู่ระหว่างการตรวจสอบเอกสาร (3-7 วันทำการ)' :
                             'บัญชีลูกค้าทั่วไป'}
                        </StyledText>

                        <StyledView className="space-y-3">
                            {accountType === 'member' ? (
                                <>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="checkmark-circle" size={24} className="text-green-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">สามารถรับงานและให้บริการได้</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="checkmark-circle" size={24} className="text-green-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">เข้าถึงฟีเจอร์พิเศษทั้งหมด</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="checkmark-circle" size={24} className="text-green-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">รับการแจ้งเตือนงานใหม่</StyledText>
                                    </StyledView>
                                </>
                            ) : accountType === 'pending' ? (
                                <>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="time" size={24} className="text-yellow-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">กำลังตรวจสอบเอกสารของคุณ</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="mail" size={24} className="text-yellow-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">จะแจ้งผลผ่านอีเมลของคุณ</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="calendar" size={24} className="text-yellow-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">ใช้เวลาประมาณ 3-7 วันทำการ</StyledText>
                                    </StyledView>
                                </>
                            ) : (
                                <>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="search" size={24} className="text-blue-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">ค้นหาและใช้บริการได้</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="chatbubbles" size={24} className="text-blue-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">แชทกับผู้ให้บริการได้</StyledText>
                                    </StyledView>
                                    <StyledView className="flex-row items-center">
                                        <StyledIonIcon name="person" size={24} className="text-blue-500" />
                                        <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">แก้ไขโปรไฟล์ส่วนตัวได้</StyledText>
                                    </StyledView>
                                </>
                            )}
                        </StyledView>
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledSafeAreaView>
    );
}