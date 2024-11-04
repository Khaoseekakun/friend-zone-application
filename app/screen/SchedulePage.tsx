import React, { useState, useEffect } from "react";
import { View, Text, Platform, KeyboardAvoidingView, Button, TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)
const StyledButton = styled(Button);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SchedulePage() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);

    const [schedule, setSchedule] = useState([]);
    const [userData, setUserData] = useState<any>({});


    useEffect(() => {
        (async () => {
            await fetchUserData();
            loadSchedule();
        })();
    }, []);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        setUserData(JSON.parse(userData as string) || {});
    };

    const loadSchedule = async () => {
        setLoading(true);
        try {
            const scheduleData = await axios.get(`http://49.231.43.37:8000/api/schedule/${userData.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData.token}`

                }
            });

            setSchedule(scheduleData.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const DateFromat = (date_value: string) => {
        const dateObj = new Date(date_value);
        const day = dateObj.toLocaleDateString('th-TH', { weekday: 'long' });
        const date = dateObj.getDate();
        const month = dateObj.toLocaleDateString('th-TH', { month: 'long' });
        const year = dateObj.getFullYear() + 543;
        const time = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        return `${day} ที่ ${date} ${month} พ.ศ.${year} เวลา ${time} น.`;
    }

    return (
        <StyledView className="flex-1">
            <HeaderApp />
            <StyledView className="flex-1 bg-gray-200 dark:bg-black px-2 pt-2">
                {
                    schedule.length <= 0 ? (
                        <>
                            <ScrollView>
                                <StyledView className="bg-white rounded-b-2xl rounded-tr-2xl w-full h-auto p-3">
                                    <StyledText className="font-custom">รายละเอียดการนัดหมาย</StyledText>
                                    <StyledText className="font-custom text-gray-500">{DateFromat('2024-11-25T13:05:00.000Z')}</StyledText>
                                    <StyledText className="font-custom text-gray-500">สถานที่ 181 ซอย2 ถนน รามอินทรา จังหวัดกรุงเทพมหานคร</StyledText>
                                    <StyledView className="w-full h-[1px] bg-gray-600 my-2"></StyledView>
                                    <StyledText className="font-custom text-gray-500">รูปแบบงาน</StyledText>

                                    <StyledView className="flex-row gap-2 py-2">
                                        <StyledView className="bg-[#00cB20] rounded-full">
                                            <StyledText className="font-custom text-white px-3 py-1">เพื่อนเที่ยว</StyledText>
                                        </StyledView>
                                        <StyledView className="bg-[#4A5CFF] rounded-full">
                                            <StyledText className="font-custom text-white px-3 py-1">เพื่อนช็อป</StyledText>
                                        </StyledView>
                                        <StyledView className="bg-[#FFB800] rounded-full">
                                            <StyledText className="font-custom text-black px-3 py-1">เพื่อนกิน</StyledText>
                                        </StyledView>

                                    </StyledView>


                                    <StyledView className="flex-row py-2 justify-between mt-5">
                                        <StyledText className="font-custom text-gray-500 text-xl">ทำเนียมการนัดหมาย (Moo)</StyledText>
                                        <StyledText className="font-custom text-gray-500 text-xl">200.00 ฿</StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row py-2 justify-end gap-2 items-center">
                                        <StyledTouchableOpacity>
                                            <StyledText className="font-custom text-gray-500 text-xl">ยกเลิก</StyledText>
                                        </StyledTouchableOpacity>
                                        <StyledTouchableOpacity >
                                            <LinearGradient
                                                colors={['#EB3834', '#69140F']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                className="rounded-full py-1 shadow-sm"
                                            >
                                                <StyledText className="font-custom text-white text-xl px-4">ชำระเงิน</StyledText>
                                            </LinearGradient>
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                </StyledView>
                            </ScrollView>
                        </>
                    ) : (
                        <>
                            <StyledView className="flex-1 justify-center items-center">
                                <StyledText className="text-lg font-custom">ไม่พบข้อมูล</StyledText>
                            </StyledView>
                        </>
                    )
                }
            </StyledView>
            <Navigation current="SchedulePage" />
        </StyledView>
    );
}