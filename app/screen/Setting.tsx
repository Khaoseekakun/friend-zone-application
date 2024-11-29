import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, StackActions } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);

export default function Setting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [isLogout, setIsLogout] = useState(false);
    const [userData, setUserData] = useState<any>();
    const Logout = async () => {
        setIsLogout(true);
        try {
            const logoutResponse = await axios.put("https://friendszone.app/api/oauth/login", {
                userId: userData.id,
            }, {
                headers: {
                    Authorization: `All ${userData?.token}`,
                    'Content-Type': 'application/json',
                }
            })
            if (logoutResponse.data.status === 200) {
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('userToken');
                const resetAction = StackActions.replace("Login")
                navigation.dispatch(resetAction);
            }else {
                Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            }
        } catch (error) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        }
        finally {
            setIsLogout(false);
        }
    }

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setUserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, [])

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="w-full flex-1 bg-white dark:bg-neutral-900">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`text-center top-0 ${Platform.OS == "ios" ? "h-[92px]" : "h-[60px]" } justify-center`}
                >
                    <StyledView className={`${Platform.OS == "ios" ? "mt-8" : ""}`}>
                        <TouchableOpacity onPress={() => navigation.goBack()} className="ml-4">
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">การตั้งค่า</StyledText>
                    </StyledView>
                </LinearGradient>
                <ScrollView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">บัญชีของคุณ</StyledText>
                        <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">FriendZone</StyledText>
                    </StyledView>

                    <TouchableOpacity onPress={() => navigation.navigate("AccountSetting")}>
                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                            <StyledView className="flex-row">
                                <StyledIonicons name="person-circle-outline" size={24} className="mt-1 text-black dark:text-white" />
                                <StyledView className="ml-2">
                                    <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">ตั้งค่าบัญชี</StyledText>
                                    <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">รหัสผ่าน, รายละเอียดความเป็นส่วนตัว</StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                        </StyledView>

                    </TouchableOpacity>
                    {
                        userData?.role === "member" && (
                            <TouchableOpacity onPress={() => navigation.navigate("SettingImagePreviewFirst")}>
                                <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                                    <StyledView className="flex-row">
                                        <StyledIonicons name="image-outline" size={24} className="mt-1 text-black dark:text-white" />
                                        <StyledView className="ml-2">
                                            <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">รูปภาพเมื่อค้นหา</StyledText>
                                            <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">แก้ไขรูปภาพเมื่อค้นหา</StyledText>
                                        </StyledView>
                                    </StyledView>
                                    <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                                </StyledView>
                            </TouchableOpacity>
                        )
                    }

                    <TouchableOpacity onPress={() => navigation.navigate("SettingImagePreview")}>

                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                            <StyledView className="flex-row">
                                <StyledIonicons name="images-outline" size={24} className="mt-1 text-black dark:text-white" />
                                <StyledView className="ml-2">
                                    <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">รูปภาพตัวอย่าง</StyledText>
                                    <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">แก้ไขรูปภาพตัวอย่างหน้าโปรไฟล์</StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                        </StyledView>
                    </TouchableOpacity>
                    <StyledView className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800"></StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">ทั่วไป</StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="alert-circle-outline" size={24} className="mt-1 text-black dark:text-white" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">สถานะบัญชี</StyledText>
                                <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">ตรวจสอบสิทธิ์การใช้งาน</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                    </StyledView>

                    <TouchableOpacity onPress={() => navigation.navigate("ScheduleList")}>
                        <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                            <StyledView className="flex-row justify-center">
                                <StyledIonicons name="calendar-outline" size={24} className="mt-1 text-black dark:text-white" />
                                <StyledView className="ml-2">
                                    <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">ตารางเวลา</StyledText>
                                    <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">เวลาการนัดหมาย</StyledText>
                                </StyledView>
                            </StyledView>
                            <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                        </StyledView>
                    </TouchableOpacity>
                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="analytics-outline" size={24} className="mt-1 text-black dark:text-white" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">บันทึกประวัติ</StyledText>
                                <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">การนัดหมาย, ธุรกรรม, อื่นๆ</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                    </StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 pb-2">
                        <StyledView className="flex-row justify-center">
                            <StyledIonicons name="notifications-outline" size={24} className="mt-1 text-black dark:text-white" />
                            <StyledView className="ml-2">
                                <StyledText className=" text-gray-700 dark:text-gray-50 font-custom text-lg">การแจ้งเตือน</StyledText>
                                <StyledText className=" text-gray-500 dark:text-gray-200 font-custom text-sm ">เปิด-ปิดการแจ้งเตือน</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                    </StyledView>

                    <StyledView className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800"></StyledView>

                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                        <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">การเข้าสู่ระบบ</StyledText>
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

                            <StyledIonicons name="chevron-forward" size={24} className="text-gray-500 dark:text-gray-200" />
                        </StyledView>
                    </TouchableOpacity>
                </ScrollView>
                <StyledText className="font-custom absolute bottom-7 left-3 text-gray-300">V1.0.0</StyledText>
                <StyledText className="font-custom absolute bottom-4 left-3 text-gray-300">K2N Tech Studio</StyledText>
            </StyledView>

            <Modal
                visible={isLogout}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsLogout(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom" style={styles.modalText} >กำลังออกจากระบบ...</StyledText>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 200,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    }
});