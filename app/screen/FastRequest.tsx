import { HeaderApp } from '@/components/Header';
import { RootStackParamList } from '@/types';
import FireBaseApp from '@/utils/firebaseConfig';
import { NavigationProp, RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { get, getDatabase, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View, useColorScheme, Appearance } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FastRequest = {
    id: string;
    date: string;
    time: string;
    jobsType: string;
    location: string;
    status: 'pending' | 'accepted' | 'deleted';
    description?: string;
    requester: {
        id: string;
        profileUrl: string;
        username: string;
        gender: 'male' | 'female' | 'lgbtq';
    };
    acceptList?: string;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const database = getDatabase(FireBaseApp);

const InfoItem = ({ icon, label, value, theme }: { icon: any; label: string; value: string; theme: string | null }) => (
    <StyledView className="flex-row items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl mb-3 px-2">
        <StyledView className="bg-white dark:bg-gray-700 p-2 rounded-xl">

            <Ionicons
                name={icon}
                size={22}
                color={theme === 'dark' ? gradientColors.dark[0] : gradientColors.light[1]}
            />
        </StyledView>
        <StyledView className="ml-3 flex-1 py-2">
            <StyledText className="text-gray-500 dark:text-gray-400 text-sm font-custom">
                {label}
            </StyledText>
            <StyledText className="text-gray-900 dark:text-white text-base font-custom">
                {value}
            </StyledText>
        </StyledView>
    </StyledView>
);

const gradientColors = {
    dark: ['#EB3834', '#69140F'],
    light: ['#ec4899', '#f97316']
};

export default function FastRequest() {
    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState(colorScheme);
    const currentGradient = theme === 'dark' ? gradientColors.dark : gradientColors.light;

    const route = useRoute<RouteProp<RootStackParamList, 'FastRequest'>>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const isFocus = useIsFocused();
    const [userData, setUserData] = useState<any>({});
    const { requestId, backPage, notificationId } = route.params;
    const [request, setRequest] = useState<FastRequest>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });
        return () => {
            subscription.remove();
        }
    }, []);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        setUserData(JSON.parse(userData || '{}'));
    }

    useEffect(() => {
        if (isFocus == true) {
            
            fetchUserData();
            (async () => {
                try {
                    setLoading(true);
                    const snapshot = await get(ref(database, `fast-request/${requestId}`));
                    if (snapshot.exists()) setRequest(snapshot.val());
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isFocus]);

    const handleAcceptRequest = async () => {
        try {
            await set(ref(database, `fast-request/${requestId}/acceptList`), request?.acceptList ? `${request.acceptList},${userData.id}` : userData.id);
            navigation.goBack();
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถรับงานได้ในขณะนี้');
        }
    };

    const handleDeleteRequest = async () => {
        try {
            await Promise.all([
                set(ref(database, `notifications/${userData.id}/${notificationId}`), null)
            ]);
            navigation.goBack();
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบงานได้ในขณะนี้');
        }
    };

    if (loading) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color={currentGradient[0]} />
            </StyledView>
        );
    }

    if (!request) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-6">
                <StyledView className="items-center">
                    <Ionicons name="alert-circle" size={64} color={currentGradient[0]} />
                    <StyledText className="text-gray-600 dark:text-gray-300 font-custom text-lg text-center mt-4">
                        ไม่พบข้อมูลคำขอนี้
                    </StyledText>
                    <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-center mt-2">
                        คำขอนี้อาจถูกลบไปแล้วหรือไม่มีอยู่ในระบบ
                    </StyledText>
                </StyledView>


                <TouchableOpacity
                    onPress={() => navigation.navigate("Notification", {})}
                    className="mt-8"
                >
                    <LinearGradient
                        colors={currentGradient as any}
                        className="py-2 px-4 rounded-xl w-5/12"
                    >
                        <StyledText className="text-white text-lg font-custom text-center">
                            กลับ
                        </StyledText>
                    </LinearGradient>
                </TouchableOpacity>


            </StyledView>
        );
    }

    return (
        <StyledView className="flex-1 bg-white dark:bg-gray-900">
            <HeaderApp back={backPage} />
            <StyledScrollView className="flex-1">
                <LinearGradient
                    colors={[currentGradient[0], currentGradient[1]]}
                    className="px-4 pt-4 pb-16"
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ProfileTab', {
                            profileId: request.requester.id,
                            backPage: 'Notification'
                        })}
                        className="flex-row items-center bg-white/10 p-4 rounded-3xl"
                    >
                        <StyledImage
                            source={{ uri: request.requester.profileUrl }}
                            className="w-20 h-20 rounded-2xl"
                        />
                        <StyledView className="ml-4 flex-1">
                            <StyledText className="text-white text-xl font-custom">
                                {request.requester.username}
                            </StyledText>
                            <StyledView className="bg-white/20 self-start px-4 py-1 rounded-full mt-2">
                                <StyledText className="text-white capitalize font-custom">
                                    {request.requester.gender}
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    </TouchableOpacity>
                </LinearGradient>

                <StyledView className="px-4 -mt-12">
                    <StyledView className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg">
                        <StyledText className="text-xl text-gray-900 dark:text-white mb-4 font-custom">
                            รายละเอียดงาน
                        </StyledText>

                        <InfoItem
                            icon="calendar-outline"
                            label="วันที่"
                            value={request.date}
                            theme={theme ?? 'light'}
                        />

                        <InfoItem
                            icon="time-outline"
                            label="เวลา"
                            value={request.time}
                            theme={theme ?? 'light'}
                        />

                        <InfoItem
                            icon="briefcase-outline"
                            label="ประเภทงาน"
                            value={request.jobsType}
                            theme={theme ?? 'light'}
                        />
                        <InfoItem
                            icon="location-outline"
                            label="สถานที่"
                            value={request.location}
                            theme={theme ?? 'light'}
                        />

                        {request.description && (
                            <InfoItem
                                icon="document-text-outline"
                                label="รายละเอียดเพิ่มเติม"
                                value={`${request.description}`}
                                theme={theme ?? 'light'}
                            />
                            // <StyledView className="mt-2">
                            //     <StyledView className="flex-row items-center mb-3">
                            //         <StyledView className="bg-white dark:bg-gray-700 p-2 rounded-xl">
                            //             <Ionicons 
                            //                 name="document-text-outline" 
                            //                 size={22}
                            //                 color={theme === 'dark' ? currentGradient[0] : '#f97316'}
                            //             />
                            //         </StyledView>
                            //         <StyledText className="text-gray-900 dark:text-white font-custom ml-3">
                            //             รายละเอียดเพิ่มเติม
                            //         </StyledText>
                            //     </StyledView>
                            //     <StyledText className="text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl font-custom">
                            //         {request.description}
                            //     </StyledText>
                            // </StyledView>
                        )}


                        {
                            userData.id ? ((request.acceptList) && request.acceptList.split(',').includes(userData.id)) ? (
                                <StyledView className="bg-green-500/10 p-4 rounded-2xl mt-4">
                                    <StyledText className="text-green-500 font-custom text-center">
                                        คุณได้รับงานนี้แล้ว
                                    </StyledText>
                                </StyledView>
                            ) : (

                                <StyledView className="flex-row space-x-4 mt-8">
                                    <TouchableOpacity
                                        className="flex-1"
                                        onPress={() => {
                                            Alert.alert(
                                                "ยืนยันการรับงาน",
                                                "คุณแน่ใจหรือไม่ว่าต้องการรับงานนี้?",
                                                [
                                                    { text: "ยกเลิก", style: "cancel" },
                                                    { text: "ยืนยัน", onPress: handleAcceptRequest }
                                                ]
                                            );
                                        }}
                                    >
                                        <LinearGradient
                                            colors={currentGradient as any}
                                            className="py-2 rounded-xl"
                                        >
                                            <StyledText className="text-white text-center text-lg font-custom">
                                                รับงาน
                                            </StyledText>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1"
                                        onPress={() => {
                                            Alert.alert(
                                                "ยืนยันการลบ",
                                                "คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?",
                                                [
                                                    { text: "ยกเลิก", style: "cancel" },
                                                    { text: "ยืนยัน", onPress: handleDeleteRequest }
                                                ]
                                            );
                                        }}
                                    >
                                        <StyledView className="bg-gray-500 py-2 rounded-xl">
                                            <StyledText className="text-white text-center text-lg font-custom">
                                                ลบ
                                            </StyledText>
                                        </StyledView>
                                    </TouchableOpacity>
                                </StyledView>
                            ) : null
                        }
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </StyledView>
    );
}