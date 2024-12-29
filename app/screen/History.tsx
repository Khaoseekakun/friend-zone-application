import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, TouchableOpacity, useColorScheme, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp, useIsFocused } from "@react-navigation/native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const Icon = require('../../assets/images/logo.png');

type HistoryTab = 'transactions' | 'appointments';

interface Transaction {
    id: string;
    amount: number;
    to: 'member' | 'customer' | 'system',
    fromAccountId: string,
    fromSystem: boolean,
    accountType: 'member' | 'customer',
    actionType: 'deposit' | 'withdraw',
    memberId: string,
    customerId: string,
    refId: string,
    status: 'completed' | 'pending',
    bankAccountId?: string,
    createdAt: string,
    updatedAt: string,
}

interface Appointment {
    id: string;
    date: string;
    time: string;
    location: string;
    status: 'completed' | 'upcoming' | 'cancelled';
    partnerName: string;
    jobType: string;
    price: number;
}

export default function History() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [activeTab, setActiveTab] = useState<HistoryTab>('transactions');
    const colorScheme = useColorScheme();
    const isFocus = useIsFocused()
    const [userData, setUserData] = useState<any>({});


    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setUserData(JSON.parse(userData as string) || {});
        };

        fetchUserData();
    }, [])

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const mockAppointments: Appointment[] = [
        {
            id: '1',
            date: '2024-03-18',
            time: '14:00',
            location: 'สยามพารากอน',
            status: 'upcoming',
            partnerName: 'คุณสมหญิง รักเที่ยว',
            jobType: 'เพื่อนเที่ยว',
            price: 1500
        },
        {
            id: '2',
            date: '2024-03-17',
            time: '18:00',
            location: 'เซ็นทรัลเวิลด์',
            status: 'completed',
            partnerName: 'คุณมานะ สุขใจ',
            jobType: 'เพื่อนทานข้าว',
            price: 800
        }
    ];

    const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
        // const bank = bankInfo[transaction.bank];
        const isIncoming = transaction.actionType === 'deposit';
        return (
            <StyledView className="bg-white dark:bg-neutral-800 rounded-xl p-3 mb-3 shadow-sm">
                <StyledView className={`flex-row items-center ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                    <StyledView className="flex-row items-center flex-1">
                        <StyledImage
                            source={Icon}
                            className="w-12 h-12 rounded-full"
                        />
                        <StyledView className="ml-3 flex-1">
                            <StyledText className="font-custom text-base text-gray-900 dark:text-gray-100">
                                {isIncoming ? 'ได้รับเงินเข้าบัญชี' : 'ชำระค่าบริการ FriendZone'}
                            </StyledText>
                            <StyledText className="font-custom text-sm text-gray-500 dark:text-gray-400">
                                {
                                    transaction.to === "system" ? `เข้า บัญชีของ Friendzone` : `เข้าบัญชีในรายการของคุณ`
                                }
                            </StyledText>
                            <StyledText className="font-custom text-sm text-gray-500 dark:text-gray-400">
                                {transaction.fromSystem ? 'จากระบบ' : 'จากสมาชิก'}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledView className="items-end">
                        <StyledText
                            className={`font-custom text-lg ${isIncoming ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                                }`}
                        >
                            {isIncoming ? '+' : '-'}
                            {transaction.amount.toLocaleString()}.00
                        </StyledText>
                        <StyledText className="font-custom text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString('th-TH')}
                        </StyledText>
                        <StyledText className="font-custom text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleTimeString('th-TH')}
                        </StyledText>
                    </StyledView>
                </StyledView>
            </StyledView>
        );
    };

    const AppointmentItem: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
        return (
            <TouchableOpacity
                className="bg-white dark:bg-neutral-800 rounded-xl p-4 mb-3 shadow-sm"
            >
                <StyledView className="flex-row justify-between items-center mb-2">
                    <StyledView className="flex-row items-center">
                        <LinearGradient
                            colors={['#EB3834', '#69140F']}
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        >
                            <StyledIonIcon
                                name="calendar"
                                size={24}
                                color="#FFFFFF"
                            />
                        </LinearGradient>
                        <StyledView>
                            <StyledText className="font-custom text-lg dark:text-white">
                                {appointment.jobType}
                            </StyledText>
                            <StyledText className="font-custom text-base text-gray-500">
                                ฿{appointment.price.toLocaleString()}.00
                            </StyledText>
                        </StyledView>
                    </StyledView>
                    <StyledText
                        className={`font-custom ${appointment.status === 'completed' ? 'text-green-600' :
                            appointment.status === 'upcoming' ? 'text-blue-600' :
                                'text-red-600'
                            }`}
                    >
                        {appointment.status === 'completed' ? 'เสร็จสิ้น' :
                            appointment.status === 'upcoming' ? 'กำลังจะถึง' : 'ยกเลิก'}
                    </StyledText>
                </StyledView>

                <StyledView className="space-y-2">
                    <StyledView className="flex-row items-center">
                        <StyledIonIcon name="person-outline" size={16} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <StyledText className="font-custom text-gray-600 dark:text-gray-400 ml-2">
                            {appointment.partnerName}
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center">
                        <StyledIonIcon name="calendar-outline" size={16} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <StyledText className="font-custom text-gray-600 dark:text-gray-400 ml-2">
                            {new Date(appointment.date).toLocaleDateString('th-TH')} {appointment.time}
                        </StyledText>
                    </StyledView>

                    <StyledView className="flex-row items-center">
                        <StyledIonIcon name="location-outline" size={16} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <StyledText className="font-custom text-gray-600 dark:text-gray-400 ml-2">
                            {appointment.location}
                        </StyledText>
                    </StyledView>
                </StyledView>
            </TouchableOpacity>
        );
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`http://49.231.43.37:3000/api/transaction/${userData?.id}?accountType=${userData?.role}`, {
                headers: {
                    Authorization: `All ${userData?.token}`,
                }
            });
            if (response.data.status == 200) {
                setTransactions(response.data.data);
            } else {
                Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            }
        } catch (error) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        }
    };

    useEffect(() => {
        if (userData?.id) {
            fetchTransactions();
        }
    }, [isFocus, activeTab, userData])

    return (
        <StyledView className="flex-1 bg-gray-100 dark:bg-black">
            {/* <HeaderApp /> */}
            <LinearGradient
                colors={['#EB3834', '#69140F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className={`text-center top-0 ${Platform.OS == "ios" ? "h-[92px]" : "h-[96px]"} justify-center`}
            >
                <StyledView className={`${Platform.OS == "ios" ? "mt-14" : "mt-8"} flex-row items-center px-4`}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SettingTab', {})}
                        className="pr-4"
                    >
                        <StyledIonIcon
                            name="chevron-back"
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <StyledText className="font-custom text-xl text-white">
                        ประวัติ
                    </StyledText>
                </StyledView>
            </LinearGradient>

            <StyledView className="flex-row px-4 py-2">
                <TouchableOpacity
                    className={`flex-1 py-3 ${activeTab === 'transactions' ? 'border-b-2 border-red-500' : ''}`}
                    onPress={() => setActiveTab('transactions')}
                >
                    <StyledText className={`font-custom text-center text-lg ${activeTab === 'transactions' ? 'text-red-500' : 'text-gray-500'}`}>
                        ธุรกรรม
                    </StyledText>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    className={`flex-1 py-3 ${activeTab === 'appointments' ? 'border-b-2 border-red-500' : ''}`}
                    onPress={() => setActiveTab('appointments')}
                >
                    <StyledText className={`font-custom text-center text-lg ${activeTab === 'appointments' ? 'text-red-500' : 'text-gray-500'}`}>
                        นัดหมาย
                    </StyledText>
                </TouchableOpacity> */}
            </StyledView>

            <StyledScrollView className="flex-1 px-4">
                {activeTab === 'transactions' ? (
                    transactions.length > 0 ? transactions.map(transaction => (
                        <TransactionItem key={transaction?.id} transaction={transaction} />
                    )) : (
                        <StyledText className="text-center mt-4 text-gray-500 dark:text-gray-400 font-custom">ไม่พบข้อมูล</StyledText>
                    )
                ) : (
                    mockAppointments.map(appointment => (
                        <AppointmentItem key={appointment.id} appointment={appointment} />
                    ))
                )}
                <StyledView className="h-24" />
            </StyledScrollView>
        </StyledView>
    );
}