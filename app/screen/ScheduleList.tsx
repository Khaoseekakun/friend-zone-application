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
    const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');
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
            <StyledView className="flex-1 bg-gray-200 dark:bg-black px-2 pt-2">
                {loading ? (
                    <>
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom text-center">กำลังโหลดข้อมูล...</StyledText>
                    </>
                ) :
                    schedule.length > 0 ? (
                        <ScrollView>
                            {
                                schedule.map((item, index) => (
                                    <StyledView key={`${item.id}-${index}-${makeid(10)}`}>
                                        <StyledView key={`${item.id}-${index}-${userData.id}-${randomInt}`} className="bg-white rounded-b-2xl rounded-tr-2xl w-full h-auto p-3">
                                            <StyledText className="font-custom">รายละเอียดการนัดหมาย</StyledText>
                                            <StyledText className="font-custom text-gray-500">{DateFromat(item.date)}</StyledText>
                                            <StyledText className="font-custom text-gray-500">สถานที่ {item.location}</StyledText>
                                            <StyledView className="w-full h-[1px] bg-gray-600 my-2"></StyledView>

                                            <StyledText className="font-custom text-gray-600 dark:text-gray-300 mt-2">
                                                รูปแบบงาน: {jobsList.find(j => j.id === item.jobs)?.jobName}
                                            </StyledText>

                                            <StyledView className="flex-row py-2 justify-between mt-5">
                                                <StyledText className="font-custom text-gray-500 text-xl">ทำเนียมการนัดหมาย</StyledText>
                                                <StyledText className="font-custom text-gray-500 text-xl">{item.price?.toLocaleString()}</StyledText>
                                            </StyledView>

                                            {
                                                item.status === "wait_approve" && userData.role === "member" ? (
                                                    <StyledView className="flex-row py-2 justify-end gap-2 items-center">
                                                        <StyledTouchableOpacity onPress={() => updateScheduleStatus(item.id, 'schedule_cancel', "ยืนยันการยกเลิกการนัดหมาย")}>
                                                            <StyledText className="font-custom text-gray-500 text-xl">ยกเลิก</StyledText>
                                                        </StyledTouchableOpacity>
                                                        <StyledTouchableOpacity
                                                            onPress={() => updateScheduleStatus(item.id, 'wait_payment', 'ยืนยันการนัดหมาย')}
                                                        >
                                                            <LinearGradient
                                                                colors={['#EB3834', '#69140F']}
                                                                start={{ x: 0, y: 0 }}
                                                                end={{ x: 1, y: 0 }}
                                                                className="rounded-full py-1 shadow-sm"
                                                            >
                                                                <StyledText className="font-custom text-white text-xl px-4">ยืนยันการนัดหมาย</StyledText>
                                                            </LinearGradient>
                                                        </StyledTouchableOpacity>
                                                    </StyledView>
                                                ) : null
                                            }
                                        </StyledView>
                                        <StyledText
                                            className={`font-custom text-right pr-2 mb-2 ${getStatusColor(item.status)}`}
                                        >
                                            {
                                                item.status === "wait_approve" ?
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
                                ))
                            }

                        </ScrollView>
                    ) : (
                        <StyledView className="flex-1 justify-center items-center">
                            <StyledText className="text-lg font-custom">ไม่พบข้อมูล</StyledText>
                        </StyledView>
                    )
                }


            </StyledView>
            <Navigation current="SchedulePage" />
            <Modal visible={paymentLoading} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom" style={styles.modalText}>โปรดรอสักครู่กำลังสร้างรายการชำระเงิน...</StyledText>
                    </View>
                </View>
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