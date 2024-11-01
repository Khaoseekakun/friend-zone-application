import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, StackActions } from "@react-navigation/native";

import * as Updates from 'expo-updates'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);

export default function Setting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);


    const Logout = async () => {
        setLoading(true);
        try {
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userToken');
            const resetAction = StackActions.replace("Login")
            navigation.dispatch(resetAction);
        } catch (error) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="w-full flex-1 bg-white">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="text-center top-0 h-[92px] justify-center"
                >
                    <StyledView className="mt-5">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute ml-4">
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">การตั้งค่า</StyledText>
                    </StyledView>
                </LinearGradient>
                <ScrollView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 font-custom">บัญชีของคุณ</StyledText>
                        <StyledText className=" text-gray-500 font-custom">FriendZone</StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                        <StyledView className="flex-row">
                            <StyledIonicons name="person-circle-outline" size={24} color="black" className="mt-1" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 font-custom text-lg">ตั้งค่าบัญชี</StyledText>
                                <StyledText className=" text-gray-500 font-custom text-sm ">รหัสผ่าน, รายละเอียดความเป็นส่วนตัว</StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledIonicons name="chevron-forward" size={24} color="gray" />
                    </StyledView>
                    <StyledView className="w-full h-1.5 bg-gray-100"></StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 font-custom">ทั่วไป</StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="calendar-outline" size={24} color="black" className="" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 font-custom text-lg">ตารางเวลา</StyledText>
                                <StyledText className=" text-gray-500 font-custom text-sm ">เวลาการนัดหมาย</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} color="gray" />
                    </StyledView>
                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="analytics-outline" size={24} color="black" className="" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 font-custom text-lg">บันทึกประวัติ</StyledText>
                                <StyledText className=" text-gray-500 font-custom text-sm ">การนัดหมาย, ธุรกรรม, อื่นๆ</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} color="gray" />
                    </StyledView>
                    <StyledView className="flex-row items-center justify-between w-full px-3 pb-2">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="notifications-outline" size={24} color="black" className="" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 font-custom text-lg">การแจ้งเตือน</StyledText>
                                <StyledText className=" text-gray-500 font-custom text-sm ">เปิด-ปิดการแจ้งเตือน</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} color="gray" />
                    </StyledView>

                    <StyledView className="w-full h-1.5 bg-gray-100"></StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 font-custom">การเข้าสู่ระบบ</StyledText>
                    </StyledView>

                    <TouchableOpacity
                        onPress={() => Logout()}
                    >
                        <StyledView className="flex-row items-center justify-between w-full px-3">
                            <StyledView className="flex-row justify-center">
                                <StyledIonicons name="log-out-outline" size={24} color="red" className="" />
                                <StyledView className="ml-2">
                                    <StyledText className=" text-red-500 font-custom text-lg">ออกจากระบบ</StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledIonicons name="chevron-forward" size={24} color="gray" />
                        </StyledView>
                    </TouchableOpacity>
                </ScrollView>
            </StyledView>
        </KeyboardAvoidingView >
    );
}
