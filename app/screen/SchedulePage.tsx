import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Modal, Alert, Linking } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getDatabase, ref, onValue, update } from "firebase/database";
import FireBaseApp from "../../utils/firebaseConfig";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Ionicons } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Schedule {
    id: string;
    customerId: string;
    memberId: string;
    date: string;
    location: string;
    jobs: string;
    latitude: number;
    longitude: number;
    status: string;
    price: number;
    paymentId?: string;
}

const STATUS_DISPLAY = {
    wait_approve: {
        customer: "รอการยืนยันจากสมาชิก",
        member: "คำขอรอการตอบกลับ",
        color: "text-yellow-400"
    },
    wait_payment: {
        customer: "รอการชำระเงิน",
        member: "รอการตรวจสอบการชำระเงิน",
        color: "text-orange-400"
    },
    payment_success: {
        customer: "ชำระเงินสำเร็จ (โปรดรอถึงเวลานัดหมาย)",
        member: "การชำระเงินได้รับการยืนยัน (โปรดเตรียมตัวสำหรับการนัดหมาย)",
        color: "text-green-500"
    },
    schedule_cancel: {
        customer: "การนัดหมายถูกยกเลิก",
        member: "การนัดหมายถูกยกเลิก",
        color: "text-red-500"
    },
    schedule_working: {
        customer: "กำลังทำงาน",
        member: "กำลังทำงาน",
        color: "text-indigo-500"
    },
    schedule_end_success: {
        customer: "การนัดหมายสิ้นสุด (สำเร็จ)",
        member: "การนัดหมายสิ้นสุด (สำเร็จ)",
        color: "text-green-600"
    },
    schedule_cancel_after_payment: {
        customer: "การนัดหมายถูกยกเลิก",
        member: "การนัดหมายถูกยกเลิกจากลูกค้า",
        color: "text-red-500"
    }
};

export default function SchedulePage() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jobsList, setJobList] = useState<{
        id: string;
        jobName: string;
        jobCategoryId: string;
    }[]>([]);

    const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');

    useEffect(() => {
        (async () => {
            await loadUserData();
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

    const loadUserData = async () => {
        try {
            const data = await AsyncStorage.getItem('userData');

            if (data) {
                const parsedData = JSON.parse(data);
                setUserData(parsedData);
                subscribeToSchedules(parsedData.id);
            } else {
                setError('ไม่พบข้อมูลผู้ใช้');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
            setLoading(false);
        }
    };

    const subscribeToSchedules = (userId: string) => {

        try {
            const schedulesRef = ref(database, 'schedules');

            onValue(schedulesRef, (snapshot) => {
                const schedulesData: Schedule[] = [];

                snapshot.forEach((childSnapshot) => {
                    const schedule = childSnapshot.val();

                    if (schedule &&
                        (schedule.customerId === userId || schedule.memberId === userId) &&
                        schedule.status !== 'deleted') {
                        schedulesData.push({
                            ...schedule,
                            id: childSnapshot.key as string
                        });
                    }
                });

                setSchedules(schedulesData);
                setLoading(false);
            }, (error) => {
                console.error('Firebase subscription error:', error);
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูลการนัดหมาย');
                setLoading(false);
            });
        } catch (error) {
            console.error('Error setting up Firebase subscription:', error);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล');
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateString;
        }
    };

    const updateStatus = async (scheduleId: string, newStatus: string, message?: string, content?: string) => {
        const updateScheduleStatus = async () => {
            try {
                await update(ref(database, `schedules/${scheduleId}`), {
                    status: newStatus
                });
            } catch (error) {
                console.error('Status update error:', error);
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่');
            }
        };

        if (message) {
            Alert.alert(message, content, [
                { text: 'ยกเลิก', style: 'cancel' },
                { text: 'ยืนยัน', onPress: updateScheduleStatus }
            ]);
        } else {
            await updateScheduleStatus();
        }
    };

    const createPayment = async (scheduleId: string) => {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        setPaymentLoading(true);
        try {
            if (schedule.paymentId) {
                await Linking.openURL(schedule.paymentId);
            } else {
                const response = await axios.post(
                    'https://friendszone.app/api/stripe/create-payment-intent',
                    {
                        amount: (schedule.price) * 100,
                        customerId: schedule.customerId,
                        memberId: schedule.memberId,
                        scheduleId: schedule.id
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Customer ${userData.token}`
                        }
                    }
                );

                if (response.data.status === 200) {
                    await Linking.openURL(response.data.data.url);
                } else {
                    throw new Error('Payment creation failed');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างรายการชำระเงินได้ กรุณาลองใหม่');
        } finally {
            setPaymentLoading(false);
        }
    };

    const ScheduleItem = ({ schedule }: { schedule: Schedule }) => {
        const status = STATUS_DISPLAY[schedule.status as keyof typeof STATUS_DISPLAY];

        return (
            <>
                <StyledView className="mb-1 bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
                    <StyledText className="font-custom text-gray-600 dark:text-gray-300">
                        {formatDate(schedule.date)}
                    </StyledText>

                    <StyledText className="font-custom text-gray-600 dark:text-gray-300 mt-2">
                        สถานที่: {schedule.location}
                    </StyledText>

                    <StyledText className="font-custom text-gray-600 dark:text-gray-300 mt-2">
                        รูปแบบงาน: {jobsList.find(j => j.id === schedule.jobs)?.jobName}
                    </StyledText>

                    <StyledView className="flex-row justify-between items-center mt-4">
                        <StyledText className="font-custom text-gray-700 dark:text-gray-300">
                            ค่าธรรมเนียม
                        </StyledText>
                        <StyledText className="font-custom text-xl text-gray-800 dark:text-gray-200">
                            ฿{(schedule.price)?.toLocaleString()}
                        </StyledText>
                    </StyledView>

                    {((schedule.status === 'wait_payment' && userData.role === 'customer') || (schedule.status === 'wait_approve' && userData.role === 'member')) && (
                        <StyledView className="flex-row justify-end mt-4 space-x-3">
                            <StyledTouchableOpacity
                                className="bg-gray-200 dark:bg-neutral-700 px-4 py-2 rounded-full"
                                onPress={() => updateStatus(schedule.id, 'schedule_cancel', 'ยืนยันการยกเลิกการนัดหมาย?')}
                            >
                                <StyledText className="font-custom text-gray-700 dark:text-gray-300">
                                    ยกเลิก
                                </StyledText>
                            </StyledTouchableOpacity>

                            <StyledTouchableOpacity
                                onPress={() => {
                                    if (schedule.status === 'wait_payment') {
                                        createPayment(schedule.id);
                                    } else {
                                        updateStatus(schedule.id, 'wait_payment', 'ยืนยันการนัดหมาย?');
                                    }
                                }}
                            >
                                <LinearGradient
                                    colors={['#EB3834', '#69140F']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-full px-6 py-2"
                                >
                                    <StyledText className="font-custom text-white">
                                        {schedule.status === 'wait_payment' ? 'ชำระเงิน' : 'ยืนยัน'}
                                    </StyledText>
                                </LinearGradient>
                            </StyledTouchableOpacity>
                        </StyledView>
                    )}

                    {
                        (schedule.status === "payment_success" && userData.role == 'customer') && (
                            <StyledView className="flex-row justify-end mt-4 space-x-3">
                                <StyledTouchableOpacity
                                    className="bg-red-500 dark:bg-neutral-700 px-4 py-2 rounded-full"
                                    onPress={() => updateStatus(schedule.id, 'schedule_cancel_after_payment', 'ยืนยันการยกเลิกการนัดหมาย?', 'การยกเลิกนี้คุณจะไม่ได้รับเงินคืน')}
                                >
                                    <StyledText className="font-custom text-gray-200 dark:text-gray-300">
                                        ยกเลิก
                                    </StyledText>
                                </StyledTouchableOpacity>
                            </StyledView>
                        )
                    }
                </StyledView>

                <StyledText className={`text-right font-custom mb-2 ${status?.color}`}>
                    {userData.role === 'customer' ? status?.customer : status?.member}
                </StyledText>
            </>
        );
    };

    return (
        <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-900">
            <HeaderApp />

            <StyledView className="flex-1 px-4 pt-4">
                {loading ? (
                    <StyledView className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom mt-4 text-gray-600 dark:text-gray-300">
                            กำลังโหลดข้อมูล...
                        </StyledText>
                    </StyledView>
                ) : error ? (
                    <StyledView className="flex-1 justify-center items-center">
                        <Ionicons name="alert-circle-outline" size={48} color="#EB3834" />
                        <StyledText className="font-custom text-lg text-red-500 mt-4 text-center">
                            {error}
                        </StyledText>
                    </StyledView>
                ) : schedules.length > 0 ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    >
                        {schedules.map((schedule) => (
                            <ScheduleItem
                                key={schedule.id}
                                schedule={schedule}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <StyledView className="flex-1 justify-center items-center">
                        <Ionicons name="calendar-outline" size={48} color="#666" />
                        <StyledText className="font-custom text-lg text-gray-600 dark:text-gray-300 mt-4">
                            ไม่พบการนัดหมาย
                        </StyledText>
                    </StyledView>
                )}
            </StyledView>

            <Navigation current="SchedulePage" />

            <Modal visible={paymentLoading} transparent animationType="fade">
                <StyledView className="flex-1 bg-black/50 justify-center items-center">
                    <StyledView className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-4/5 max-w-sm">
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom text-center mt-4 text-gray-700 dark:text-gray-300">
                            กำลังสร้างรายการชำระเงิน...
                        </StyledText>
                    </StyledView>
                </StyledView>
            </Modal>
        </StyledView>
    );
}