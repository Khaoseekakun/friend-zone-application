import { HeaderApp } from '@/components/Header';
import { RootStackParamList } from '@/types';
import FireBaseApp from '@/utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { get, getDatabase, ref, set } from 'firebase/database';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledIonicons = styled(Ionicons);
const database = getDatabase(FireBaseApp);
const StyledScrollView = styled(ScrollView);

type FastRequset = {
    id: string,
    date: string,
    jobsType: string,
    location: string,
    status: 'pending' | 'accepted' | 'deleted',
    description?: string,
    requester: {
        id: string,
        profileUrl: string,
        username: string
        gender: 'male' | 'female' | 'lgbtq'
    }
}

export default function FastRequest() {
    type PostUpdateParam = RouteProp<RootStackParamList, 'FastRequest'>;
    const route = useRoute<PostUpdateParam>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    const isFocus = useIsFocused()

    const { requestId, backPage, notificationId } = route.params;
    const [request, setRequest] = useState<FastRequset>();
    const [loading, setLoading] = useState<boolean>(true);
    const loadFastRequest = async () => {
        try {
            setLoading(true);
            const refLocation = ref(database, `fast-request/${requestId}`);
            const snapshot = await get(refLocation)

            if (snapshot.exists()) {
                setRequest(snapshot.val());
            } else {
                console.log('No data available');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isFocus) {
            loadFastRequest();
        }
    }, [isFocus])


    const handleAcceptRequest = async () => {

    }

    const handleDeleteRequest = async () => {
        try {
            const notiRef = ref(database, `notifications/${request?.requester.id}/${notificationId}`);
            await set(notiRef, null)
        } catch (error) {
            console.error(error);
            backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack();
        }
    }

    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-black">
            <HeaderApp back={backPage} />

            <StyledScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {
                    loading ? (
                        <>
                            <ActivityIndicator size="large" color="#EB3834" />
                        </>
                    ) : request ? (
                        <StyledView className="p-4 border-[1px] m-2 rounded-lg border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('ProfileTab', { 
                                        profileId: request.requester.id,
                                        backPage: 'Notification'
                                    })
                                }}
                            >
                                <StyledView className="flex-row items-center mb-2 border-b-[1px] pb-2 border-gray-300 dark:border-gray-700 shadow-sm rounded-lg">
                                    <StyledImage
                                        source={{ uri: request.requester.profileUrl }}
                                        style={{ width: 100, height: 100, borderRadius: 15 }}
                                    />
                                    <StyledView className="ml-3">
                                        <StyledText className="text-xl text-gray-900 dark:text-white font-custom">{request.requester.username}</StyledText>
                                        <StyledText className="text-gray-400 dark:text-gray-300 font-custom">{request.requester.gender}</StyledText>
                                    </StyledView>
                                </StyledView>
                            </TouchableOpacity>

                            <StyledText className="text-xl text-gray-900 dark:text-white font-custom">รายละเอียดงาน</StyledText>
                            <StyledView className='flex-row items-center mt-2'>
                                <StyledText className="text-gray-400 dark:text-gray-300 font-custom">วันที่ : </StyledText>
                                <StyledText className="font-custom">{request.date}</StyledText>
                            </StyledView>

                            <StyledView className='flex-row items-center mt-2'>
                                <StyledText className="text-gray-400 dark:text-gray-300 font-custom">ประเภทงาน : </StyledText>
                                <StyledText className="font-custom">{request.jobsType}</StyledText>
                            </StyledView>

                            <StyledView className='flex-row items-center mt-2'>
                                <StyledText className="text-gray-400 dark:text-gray-300 font-custom">สถานที่ : </StyledText>
                                <StyledText className="font-custom">{request.location}</StyledText>
                            </StyledView>

                            <StyledView className='flex-row items-center mt-2'>
                                <StyledText className="text-gray-400 dark:text-gray-300 font-custom">ผู้ร้องขอ : </StyledText>
                                <StyledText className="font-custom">{request.requester.username}</StyledText>
                            </StyledView>
                            {
                                request.description ? (
                                    <StyledView className='mt-2'>
                                        <StyledText className="text-gray-400 dark:text-gray-300 font-custom">รายละเอียดเพิ่มเติม : </StyledText>
                                        <StyledText className="font-custom">{request.description}</StyledText>
                                    </StyledView>
                                ) : null
                            }
                            <StyledView className="mt-4 flex-row justify-around">
                                <StyledView className='w-6/12 pr-2'>
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert(
                                            "ยืนยันการรับงาน",
                                            "คุณแน่ใจหรือไม่ว่าต้องการรับงานนี้?",
                                            [
                                                {
                                                    text: "ยกเลิก",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "ยืนยัน",
                                                    onPress: handleAcceptRequest
                                                }
                                            ]
                                        );
                                    }}>
                                        <StyledView className="bg-red-500 p-2 rounded">
                                            <StyledText className="text-white font-custom text-center">รับงาน</StyledText>
                                        </StyledView>
                                    </TouchableOpacity>
                                </StyledView>
                                <StyledView className='w-6/12 pl-2'>
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert(
                                            "ยืนยันการลบ",
                                            "คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?",
                                            [
                                                {
                                                    text: "ยกเลิก",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "ยืนยัน",
                                                    onPress: handleDeleteRequest
                                                }
                                            ]
                                        );
                                    }}>
                                        <StyledView className="bg-gray-500 p-2 rounded">
                                            <StyledText className="text-white font-custom text-center">ลบ</StyledText>
                                        </StyledView>
                                    </TouchableOpacity>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    ) : (
                        <StyledView className="flex-1 justify-center items-center h-full">
                            <StyledText className="text-gray-500 dark:text-white font-custom mt-5">
                                ไม่พบข้อมูลหรือคำขอนี้ถูกลบแล้ว
                            </StyledText>
                        </StyledView>
                    )
                }

            </StyledScrollView>
        </StyledView>
    )
}