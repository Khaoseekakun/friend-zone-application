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
import { openMap } from "@/utils/Gps";
import { addNotification, sendPushNotification } from "@/utils/Notification";
import { MapPin, Briefcase, Calendar, AlertCircle, DollarSign } from 'lucide-react-native';
import { DateFormat } from "@/utils/Date";

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
    longtitude: number;
    status: string;
    price: number;
    paymentId?: string;
    start_time: number;
    end_time: number;
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

    const database = getDatabase(FireBaseApp);

    useEffect(() => {
        (async () => {
            await loadUserData();
        })();
    }, []);

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



    const updateStatus = async (scheduleId: string, newStatus: string, message?: string, content?: string) => {
        const updateScheduleStatus = async () => {
            try {
                await update(ref(database, `schedules/${scheduleId}`), {
                    status: newStatus
                });

                const memberId = schedules.find(s => s.id === scheduleId)?.memberId
                const userId = schedules.find(s => s.id === scheduleId)?.customerId
                if (memberId) {
                    if (newStatus === 'schedule_cancel_after_payment') {
                        addNotification(
                            memberId, {
                            type: "alert",
                            content: "การนัดหมายถูกยกเลิกจากลูกค้า",
                            timestamp: new Date().toISOString(),
                            isRead: false,
                            data: {

                            }
                        }
                        )

                        sendPushNotification(userData.token, memberId, {
                            title: "การนัดหมายถูกยกเลิก",
                            body: "การนัดหมายถูกยกเลิกจากลูกค้า",
                            screen: {
                                name: "SchedulePage",
                                data: {}
                            }
                        })
                    }

                    if (newStatus === 'schedule_cancel') {
                        addNotification(
                            memberId, {
                            type: "alert",
                            content: "การนัดหมายถูกยกเลิก",

                            timestamp: new Date().toISOString(),
                            isRead: false,
                            data: {

                            }
                        }
                        )

                        sendPushNotification(userData.token, memberId, {
                            title: "การนัดหมายถูกยกเลิก",
                            body: "การนัดหมายถูกยกเลิก",
                            screen: {
                                name: "SchedulePage",
                                data: {}
                            }
                        })
                    }
                }

                if (userId) {
                    if (newStatus === 'wait_payment') {
                        addNotification(
                            userId, {
                            type: "alert",
                            content: "สมาชิกได้ยืนยันการนัดหมาย กรุณาชำระเงิน ในหน้านัดหมาย",

                            timestamp: new Date().toISOString(),
                            isRead: false,
                            data: {

                            }
                        }
                        )

                        sendPushNotification(userData.token, userId, {
                            title: "สมาชิกได้ยืนยันการนัดหมาย",
                            body: "กรุณาชำระเงิน ในหน้านัดหมาย",
                            screen: {
                                name: "SchedulePage",
                                data: {}
                            }
                        })
                    }
                }
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
            <StyledView className="mb-3">
                {/* Modern Glass Card Container */}
                <StyledView
                    className="bg-gray-200/70 dark:bg-neutral-900/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl
                              border border-gray-100/20 dark:border-neutral-700/30">

                    {/* Date Header with Gradient */}
                    <LinearGradient
                        colors={['#1a1a1a', '#333333']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-2xl px-4 py-3 mb-3"
                    >
                        <StyledText className="font-custom text-base text-gray-100">
                            {DateFormat(schedule.date)}
                        </StyledText>
                    </LinearGradient>

                    {/* Content Container */}
                    <StyledView className="space-y-2">
                        {/* Location Section */}
                        <TouchableOpacity
                            className="flex-row items-center bg-gray-300 dark:bg-neutral-800/80 p-1 rounded-full"
                            onPress={() => {
                                openMap({
                                    lat: schedule.latitude,
                                    lng: schedule.longtitude,
                                    label: schedule.location
                                })
                            }}>
                            <StyledView className="w-10 h-10 bg-gray-100/50 dark:bg-neutral-800/50 rounded-full items-center justify-center mr-1">
                                <MapPin size={20} color="#FF4B45" />
                            </StyledView>
                            <StyledText className="font-custom flex-1 text-gray-700 dark:text-gray-300 text-base">
                                {schedule.location}
                            </StyledText>
                        </TouchableOpacity>

                        {/* Job Type Section */}
                        <StyledView className="flex-row items-center bg-gray-300 dark:bg-neutral-800/80 p-1 rounded-full">
                            <StyledView className="w-10 h-10 bg-gray-100/50 dark:bg-neutral-800/50 rounded-full items-center justify-center mr-1">
                                <Briefcase size={20} color="#FF4B45" />
                            </StyledView>
                            <StyledText className="font-custom text-gray-700 dark:text-gray-300 text-base">
                                {schedule.jobs}
                            </StyledText>
                        </StyledView>

                        {/* Price Section with Glass Effect */}
                        <StyledView className="flex-row items-center bg-gray-300 dark:bg-neutral-800/80 p-1 rounded-full">
                            <StyledView className="w-10 h-10 bg-gray-100/50 dark:bg-neutral-800/50 rounded-full items-center justify-center mr-1">
                                <DollarSign size={20} color="#FF4B45" />
                            </StyledView>
                            <StyledText className="font-custom text-gray-700 dark:text-gray-300 text-base">
                                {schedule.price} บาท
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Action Buttons */}
                    {((schedule.status === 'wait_payment' && userData.role === 'customer') ||
                        (schedule.status === 'wait_approve' && userData.role === 'member')) && (
                            <StyledView className="flex-row justify-end space-x-3 mt-2">
                                <StyledTouchableOpacity
                                    className="bg-gray-900/10 dark:bg-white/5 backdrop-blur-md px-6 py-2 
                                         rounded-2xl border border-gray-200/20 dark:border-neutral-700/30"
                                    onPress={() => updateStatus(schedule.id, 'schedule_cancel', 'ยืนยันการยกเลิกการนัดหมาย?')}
                                >
                                    <StyledText className="font-custom text-gray-700 dark:text-gray-300 font-medium">
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
                                        colors={['#FF4B45', '#FF1500']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="rounded-2xl px-8 py-2 shadow-lg"
                                    >
                                        <StyledText className="font-custom text-white font-semibold">
                                            {schedule.status === 'wait_payment' ? 'ชำระเงิน' : 'ยืนยัน'}
                                        </StyledText>
                                    </LinearGradient>
                                </StyledTouchableOpacity>
                            </StyledView>
                        )}

                    {/* Cancel After Payment Button */}
                    {(schedule.status === "payment_success" && userData.role === 'customer') && (
                        <StyledView className="flex-row justify-end mt-2">
                            <LinearGradient
                                colors={['#991B1B', '#7F1D1D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="rounded-2xl shadow-lg"
                            >
                                <StyledTouchableOpacity
                                    className="px-6 py-2"
                                    onPress={() => updateStatus(
                                        schedule.id,
                                        'schedule_cancel_after_payment',
                                        'ยืนยันการยกเลิกการนัดหมาย?',
                                        'การยกเลิกนี้คุณจะไม่ได้รับเงินคืน'
                                    )}
                                >
                                    <StyledText className="font-custom text-white font-semibold">
                                        ยกเลิก
                                    </StyledText>
                                </StyledTouchableOpacity>
                            </LinearGradient>
                        </StyledView>
                    )}
                </StyledView>

                {/* Status Text */}
                <StyledText
                    className={`text-right font-custom mt-2 mb-3 ${status?.color}`}
                >
                    {userData.role === 'customer' ? status?.customer : status?.member}
                </StyledText>
            </StyledView>
        );
    };

    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-neutral-900">
            <HeaderApp />

            <StyledView className="flex-1 px-5 pt-4 mb-11">
                {loading ? (
                    // Loading State with Smooth Animation
                    <StyledView className="flex-1 justify-center items-center">
                        <StyledView className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md 
                                     rounded-2xl p-8 shadow-xl items-center">
                            <ActivityIndicator size="large" color="#FF4B45" />
                            <StyledText className="font-custom mt-4 text-gray-600 dark:text-gray-300">
                                กำลังโหลดข้อมูล...
                            </StyledText>
                        </StyledView>
                    </StyledView>
                ) : error ? (
                    // Error State with Modern Design
                    <StyledView className="flex-1 justify-center items-center px-6">
                        <StyledView className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md 
                                     rounded-2xl p-8 shadow-xl items-center w-full max-w-sm">
                            <StyledView className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full 
                                       items-center justify-center mb-4">
                                <AlertCircle size={32} color="#EF4444" />
                            </StyledView>
                            <StyledText className="font-custom text-base text-red-500 text-center">
                                {error}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                ) : schedules?.length > 0 ? (
                    // Schedule List with Enhanced Scroll
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        className="space-y-2"
                    >
                        {schedules.map((schedule) => (
                            <ScheduleItem
                                key={schedule.id}
                                schedule={schedule}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    // Empty State with Elegant Design
                    <StyledView className="flex-1 justify-center items-center px-6">
                        <StyledView className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md 
                                     rounded-2xl p-8 shadow-xl items-center w-full max-w-sm">
                            <StyledView className="w-16 h-16 bg-gray-100 dark:bg-neutral-700 rounded-full 
                                       items-center justify-center mb-4">
                                <Calendar size={32} color="#6B7280" />
                            </StyledView>
                            <StyledText className="font-custom text-base text-gray-600 dark:text-gray-300">
                                ไม่พบการนัดหมาย
                            </StyledText>
                        </StyledView>
                    </StyledView>
                )}
            </StyledView>

            <Navigation current="SchedulePage" />

            {/* Payment Loading Modal with Glass Effect */}
            <Modal visible={paymentLoading} transparent animationType="fade">
                <StyledView className="flex-1 bg-black/60 backdrop-blur-sm justify-center items-center px-6">
                    <StyledView className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md 
                                   rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                        <StyledView className="items-center">
                            <ActivityIndicator size="large" color="#FF4B45" />
                            <StyledText className="font-custom text-center mt-4 text-gray-700 dark:text-gray-300">
                                กำลังสร้างรายการชำระเงิน...
                            </StyledText>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </Modal>
        </StyledView>
    );
}