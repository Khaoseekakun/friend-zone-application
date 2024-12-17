import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, View, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { HeaderApp } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from "@react-navigation/native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);

type HistoryTab = 'transactions' | 'appointments';
type BankType = 'PROMPTPAY' | 'TRUEMONEY' | 'SCB' | 'KBANK' | 'KTB' | 'BAY' | 'BBL' | 'TMB' | 'CIMB' | 'CITI' | 'GHB' | 'GSB' | 'HSBC' | 'IBANK' | 'ICBC' | 'KKP' | 'LHB' | 'TCRB' | 'TISCO' | 'UOB' | 'BAAC';

interface Transaction {
    id: string;
    amount: number;
    date: string;
    time: string;
    type: 'incoming' | 'outgoing';
    bank: BankType;
    bankAccount?: string;
    sender: string;
    status: 'completed' | 'pending' | 'cancelled';
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

const promptpay = require('../../assets/banks/PromptPay.png');
const scb = require('../../assets/banks/SCB.png');
const kbank = require('../../assets/banks/KBANK.png');

const bankInfo = {
    PROMPTPAY: {
        name: 'พร้อมเพย์',
        logo: promptpay,
    },
    SCB: {
        name: 'ไทยพาณิชย์',
        logo: scb,
    },
    KBANK: {
        name: 'กสิกรไทย',
        logo: kbank,
    },
};

export default function History() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [activeTab, setActiveTab] = useState<HistoryTab>('transactions');
    const colorScheme = useColorScheme();

    const groupTransactionsByDate = (transactions: Transaction[]) => {
        const groups = transactions.reduce((groups: Record<string, Transaction[]>, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
        }, {});

        return Object.entries(groups);
    };

    const mockTransactions: Transaction[] = [
        {
            id: '1',
            amount: 1500,
            date: '2024-03-18',
            time: '14:30',
            type: 'incoming',
            bank: 'KBANK',
            sender: 'นายสมชาย ใจดี',
            status: 'completed'
        },
        {
            id: '2',
            amount: 800,
            date: '2024-03-18',
            time: '13:45',
            type: 'outgoing',
            bank: 'SCB',
            bankAccount: 'xxx-x-x4589',
            sender: 'Friend Zone',
            status: 'completed'
        },
        {
            id: '3',
            amount: 2500,
            date: '2024-03-17',
            time: '16:20',
            type: 'incoming',
            bank: 'KBANK',
            bankAccount: 'xxx-x-x7823',
            sender: 'นายสมชาย ใจดี',
            status: 'pending'
        }
    ];

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
        const bank = bankInfo[transaction.bank];
        const isIncoming = transaction.type === 'incoming';

        return (
            <StyledView className="bg-white dark:bg-neutral-800 rounded-xl p-3 mb-3 shadow-sm">
                <StyledView className={`flex-row items-center ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                    <StyledView className="flex-row items-center flex-1">
                        <StyledImage
                            source={bank.logo}
                            className="w-12 h-12 rounded-full"
                        />
                        <StyledView className="ml-3 flex-1">
                            <StyledText className="font-custom text-base text-gray-900 dark:text-gray-100">
                                {transaction.type === 'incoming' ? 'ได้รับเงินโอน' : 'โอน'}
                            </StyledText>
                            <StyledText className="font-custom text-sm text-gray-500 dark:text-gray-400">
                                {bank.name} {transaction.bankAccount ? `(${transaction.bankAccount})` : ''}
                            </StyledText>
                            <StyledText className="font-custom text-sm text-gray-500 dark:text-gray-400">
                                {transaction.sender}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    <StyledView className="items-end">
                        <StyledText
                            className={`font-custom text-lg ${transaction.type === 'incoming' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                                }`}
                        >
                            {transaction.type === 'incoming' ? '+' : '-'}
                            {transaction.amount.toLocaleString()}.00
                        </StyledText>
                        <StyledText className="font-custom text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('th-TH')} {transaction.time}
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
                            color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                        />
                    </TouchableOpacity>
                    <StyledText className="font-custom text-xl dark:text-white">
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

                <TouchableOpacity
                    className={`flex-1 py-3 ${activeTab === 'appointments' ? 'border-b-2 border-red-500' : ''}`}
                    onPress={() => setActiveTab('appointments')}
                >
                    <StyledText className={`font-custom text-center text-lg ${activeTab === 'appointments' ? 'text-red-500' : 'text-gray-500'}`}>
                        นัดหมาย
                    </StyledText>
                </TouchableOpacity>
            </StyledView>

            <StyledScrollView className="flex-1 px-4">
                {activeTab === 'transactions' ? (
                    mockTransactions.map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))
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