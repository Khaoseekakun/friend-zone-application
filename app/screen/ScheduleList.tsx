import React, { useState, useEffect } from "react";
import { View, Text, Platform, KeyboardAvoidingView, Button, TouchableOpacity, Alert, Linking, Modal, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import FireBaseApp from "../../utils/firebaseConfig";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { StyleSheet } from "react-native";
import { makeid } from "@/utils/Date";
import { MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledButton = styled(Button);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ScheduleList() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [userData, setUserData] = useState<any>({});
    const database = getDatabase(FireBaseApp);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [jobsList, setJobList] = useState<{
        id: string;
        jobName: string;
        jobCategoryId: string;
    }[]>([]);
    const getStatusColor = (status: string) => {
        switch (status) {
            case "wait_approve":
                return "text-yellow-400";
            case "wait_payment":
                return "text-orange-400";
            case "payment_success":
                return "text-green-500";
            case "wait_working":
                return "text-blue-400";
            case "schedule_cancel":
                return "text-red-500";
            case "schedule_working":
                return "text-indigo-500";
            case "schedule_end_success":
                return "text-green-600";
            default:
                return "text-gray-500";
        }
    };

    useEffect(() => {
        (async () => {
            await fetchUserData();
            await loadJobsList();
        })();
    }, []);

    const loadJobsList = async () => {
        try {
            const response = await axios.get('https://friendszone.app/api/jobs/all', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData?.token}`
                }
            });


            if (response.data.status === 200) {
                setJobList(response.data.data);
            }
        } catch (error) {
            console.error('Jobs list error:', error);
        }
    }

    useEffect(() => {
        if (userData.id) {
            loadSchedule();
        }
    }, [userData]);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        setUserData(JSON.parse(userData as string) || {});
    };

    const loadSchedule = () => {
        setLoading(true);
        try {
            subscribeToSchedules(userData.id, (schedules) => {
                return setSchedule(schedules);
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    type Schedule = {
        id: string;
        customerId: string;
        memberId: string;
        date: string;
        location: string;
        jobs: string;
        latitude: number;
        longitude: number;
        status: string;
        price?: number;
        paymentId?: string;
    };

    const subscribeToSchedules = (
        userId?: string,
        onUpdate?: (schedules: Schedule[]) => void
    ) => {
        const schedulesRef = ref(database, "schedules");
        onValue(schedulesRef, (snapshot) => {
            const schedules: Schedule[] = [];

            snapshot.forEach((childSnapshot) => {
                const schedule = childSnapshot.val() as Schedule;
                schedule.id = childSnapshot.key;

                if (
                    (userId && schedule.customerId === userId) ||
                    (userId && schedule.memberId === userId)
                ) {
                    if (!(schedule.status == "deleted" || schedule.status == "wait_approve" || schedule.status == "wait_payment" || schedule.status == "schedule_cancel")) {
                        schedules.push(schedule);
                    }
                }
            });

            if (onUpdate) {
                onUpdate(schedules);
            }
        });
    };

    const DateFromat = (date_value: string) => {
        const dateObj = new Date(date_value);
        const day = dateObj.toLocaleDateString('th-TH', { weekday: 'long' });
        const date = dateObj.getDate();
        const month = dateObj.toLocaleDateString('th-TH', { month: 'long' });
        const year = dateObj.getFullYear() + 543;
        const time = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        return `${day} ที่ ${date} ${month} พ.ศ.${year} เวลา ${time} น.`;
    };

    function updateScheduleStatus(scheduleId: string, status: string, alertMessage?: string) {
        if (!alertMessage) return updateStatus();

        Alert.alert('คำเตือน', alertMessage, [
            {
                style: 'cancel',
                text: 'ยกเลิก'
            }, {
                style: "default",
                text: 'ยืนยัน',
                onPress: () => updateStatus()
            }
        ])

        async function updateStatus() {
            try {
                //firebase update status
                const scheduleRef = ref(database, `schedules/${scheduleId}`);
                await update(scheduleRef, { status: status });
            } catch (error) {
                console.log(error);
                Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตสถานะการนัดหมายได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            }
        }
    }

    const randomInt = () => Math.floor(Math.random() * 100 + 1);

    return (
        <StyledView className="flex-1">
            <HeaderApp />
            <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-900 px-4 pt-4">
                {loading ? (
                    <StyledView className="flex-1 justify-center items-center">
                        <StyledView className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md 
                                           rounded-2xl p-6 shadow-lg items-center">
                            <ActivityIndicator size="large" color="#FF4B45" />
                            <StyledText className="font-custom mt-4 text-gray-600 dark:text-gray-300">
                                กำลังโหลดข้อมูล...
                            </StyledText>
                        </StyledView>
                    </StyledView>
                ) : schedule?.length > 0 ? (
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        {schedule.map((item, index) => (
                            <StyledView key={`${item.id}-${index}-${makeid(10)}`} className="mb-4">
                                {/* Card Container */}
                                <StyledView className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md 
                                                     rounded-3xl shadow-lg border border-gray-100/20 dark:border-neutral-700/30">
                                    {/* Header with Gradient */}
                                    <LinearGradient
                                        colors={['#1a1a1a', '#333333']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="rounded-t-3xl px-5 py-4"
                                    >
                                        <StyledText className="font-custom text-white text-lg mb-1">
                                            รายละเอียดการนัดหมาย
                                        </StyledText>
                                        <StyledText className="font-custom text-gray-300">
                                            {DateFromat(item.date)}
                                        </StyledText>
                                    </LinearGradient>

                                    {/* Content Section */}
                                    <StyledView className="p-5 space-y-4">
                                        {/* Location */}
                                        <StyledView className="flex-row items-center">
                                            <StyledView className="w-10 h-10 bg-gray-100/50 dark:bg-neutral-700/50 
                                                               rounded-full items-center justify-center mr-3">
                                                <MapPin size={20} color="#FF4B45" />
                                            </StyledView>
                                            <StyledText className="font-custom text-gray-600 dark:text-gray-300 flex-1">
                                                {item.location}
                                            </StyledText>
                                        </StyledView>

                                        {/* Job Type */}
                                        <StyledView className="flex-row items-center">
                                            <StyledView className="w-10 h-10 bg-gray-100/50 dark:bg-neutral-700/50 
                                                               rounded-full items-center justify-center mr-3">
                                                <Briefcase size={20} color="#FF4B45" />
                                            </StyledView>
                                            <StyledText className="font-custom text-gray-600 dark:text-gray-300">
                                                {item.jobs}
                                            </StyledText>
                                        </StyledView>

                                        {/* Price Section */}
                                        <StyledView className="bg-gray-900/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-2 mt-1 flex-row justify-between items-end">
                                            <StyledText className="font-custom text-gray-500 dark:text-gray-400 text-sm mb-1">
                                                ค่าธรรมเนียม
                                            </StyledText>
                                            <StyledText className="font-custom text-lg text-gray-800 dark:text-gray-100 font-semibold">
                                                ฿{item.price?.toLocaleString()}
                                            </StyledText>
                                        </StyledView>

                                        {/* Action Buttons */}
                                        {item.status === "wait_approve" && userData.role === "member" && (
                                            <StyledView className="flex-row justify-end items-center space-x-3 mt-2">
                                                <StyledTouchableOpacity
                                                    className="bg-gray-100 dark:bg-neutral-700 px-5 py-2.5 rounded-xl"
                                                    onPress={() => updateScheduleStatus(item.id, 'schedule_cancel', "ยืนยันการยกเลิกการนัดหมาย")}
                                                >
                                                    <StyledText className="font-custom text-gray-600 dark:text-gray-300">
                                                        ยกเลิก
                                                    </StyledText>
                                                </StyledTouchableOpacity>

                                                <StyledTouchableOpacity
                                                    onPress={() => updateScheduleStatus(item.id, 'wait_payment', 'ยืนยันการนัดหมาย')}
                                                >
                                                    <LinearGradient
                                                        colors={['#FF4B45', '#FF1500']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                        className="rounded-xl px-6 py-2.5 shadow-lg"
                                                    >
                                                        <StyledText className="font-custom text-white">
                                                            ยืนยันการนัดหมาย
                                                        </StyledText>
                                                    </LinearGradient>
                                                </StyledTouchableOpacity>
                                            </StyledView>
                                        )}
                                    </StyledView>
                                </StyledView>

                                {/* Status Text */}
                                <StyledText className={`font-custom text-right mt-2 mb-2 ${getStatusColor(item.status)}`}>
                                    {item.status === "wait_approve" ?
                                        userData.role === "customer" ? "รอการยืนยันจากสมาชิก" : "คำขอรอการตอบกลับ" :
                                        item.status === "wait_payment" ?
                                            userData.role === "customer" ? "รอการชำระเงิน" : "รอการตรวจสอบการชำระเงิน" :
                                            item.status === "payment_success" ?
                                                userData.role === "customer" ? "ชำระเงินสำเร็จ (โปรดรอถึงเวลานัดหมาย)" : "การชำระเงินได้รับการยืนยัน (โปรดเตรียมตัวสำหรับการนัดหมาย)" :
                                                item.status === "wait_working" ?
                                                    userData.role === "customer" ? "รอการทำงาน" : "กำลังเตรียมงาน" :
                                                    item.status === "schedule_cancel" ?
                                                        userData.role === "customer" ? "การนัดหมายถูกยกเลิก" : "การนัดหมายถูกยกเลิก" :
                                                        item.status === "schedule_working" ?
                                                            userData.role === "customer" ? "กำลังทำงาน" : "กำลังทำงาน" :
                                                            item.status === "schedule_end_success" ?
                                                                userData.role === "customer" ? "การนัดหมายสิ้นสุด (สำเร็จ)" : "การนัดหมายสิ้นสุด (สำเร็จ)" :
                                                                item.status === "schedule_cancel_after_payment" ?
                                                                    userData.role === "customer" ? "การนัดหมายถูกยกเลิก" : "การนัดหมายถูกยกเลิกจากลูกค้า" : null
                                    }
                                </StyledText>
                            </StyledView>
                        ))}
                    </ScrollView>
                ) : (
                    <StyledView className="flex-1 justify-center items-center px-6">
                        <StyledView className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md 
                                           rounded-2xl p-8 shadow-xl items-center w-full max-w-sm">
                            <StyledView className="w-16 h-16 bg-gray-100 dark:bg-neutral-700 rounded-full 
                                               items-center justify-center mb-4">
                                <Calendar size={32} color="#6B7280" />
                            </StyledView>
                            <StyledText className="font-custom text-base text-gray-600 dark:text-gray-300">
                                ไม่พบข้อมูล
                            </StyledText>
                        </StyledView>
                    </StyledView>
                )}
            </StyledView>

            <Navigation current="SchedulePage" />

            {/* Payment Loading Modal */}
            <Modal visible={paymentLoading} transparent animationType="fade">
                <StyledView className="flex-1 bg-black/60 backdrop-blur-sm justify-center items-center px-6">
                    <StyledView className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md 
                                       rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                        <StyledView className="items-center">
                            <ActivityIndicator size="large" color="#FF4B45" />
                            <StyledText className="font-custom text-center mt-4 text-gray-700 dark:text-gray-300">
                                โปรดรอสักครู่กำลังสร้างรายการชำระเงิน...
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </Modal>
        </StyledView>
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