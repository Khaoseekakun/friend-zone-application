import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderApp } from '@/components/Header';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import FireBaseApp from '@/utils/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationType, RootStackParamList } from '@/types';
import { useNavigation } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledIonicons = styled(Ionicons);
export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userData, setUserData] = useState<any>();
    const database = getDatabase(FireBaseApp);



    type PostUpdateParam = RouteProp<RootStackParamList, 'Notification'>;
    const route = useRoute<PostUpdateParam>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()

    const { backPage } = route.params;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = await AsyncStorage.getItem('userData');
                setUserData(JSON.parse(userData || '{}'));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData?.id) {
            const notiRef = ref(database, `notifications/${userData.id}`);
            const unsubscribe = onValue(notiRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const notificationsArray = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setNotifications(notificationsArray.reverse());
                }
            });

            return () => unsubscribe();
        }
    }, [userData]);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'like':
                return 'heart';
            case 'comment':
                return 'chatbubble-ellipses';
            case 'appointment':
                return 'calendar';
            case 'message':
                return 'mail';
            case 'system':
                return 'notifications';
            case 'fastRequest':
                return 'rocket';
            case 'review':
                return 'star';
            default:
                return 'notifications';
        }
    };

    const getIconColor = (type: NotificationType) => {
        switch (type) {
            case 'like':
                return '#FF4B4B';
            case 'comment':
                return '#4B7BFF';
            case 'appointment':
                return '#47C479';
            case 'message':
                return '#9B51E0';
            case 'system':
                return '#FFA726';
            case 'review':
                return '#FFD700';
            case 'fastRequest':
                return '#FFA726';
            default:
                return '#FFA726';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return 'เมื่อสักครู่';
        if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
        if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
        if (days < 7) return `${days} วันที่แล้ว`;

        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePress = (notification: Notification) => {
        switch (notification.type) {
            case 'appointment':
                navigation.navigate('SchedulePage', {});
                break;
            case 'message':
                break;
            case 'like':
                break;
            case 'review':
                break;
            case 'fastRequest':
                navigation.navigate('FastRequest', {
                    requestId: notification.data.requestId as string,
                    backPage: 'Notification',
                    notificationId: notification.id as string
                });
                break;
            case 'comment':
                navigation.navigate('PostView', {
                    postId: notification.data.postId as string
                });
                break;
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <StyledTouchableOpacity
            className={`mx-3 my-1 rounded-2xl overflow-hidden ${item.isRead ? 'bg-white dark:bg-neutral-900' : 'bg-red-50 dark:bg-neutral-800'}`}
            onPress={() => {
                //set notification to read
                if (item.isRead === false) {
                    set(ref(database, `notifications/${userData.id}/${item.id}/isRead`), true);
                }
                handlePress(item);


            }}
        >
            <LinearGradient
                colors={colorScheme === 'dark' ?
                    [item.isRead ? '#1a1a1a' : '#2a1a1a', item.isRead ? '#0a0a0a' : '#1a0a0a'] :
                    [item.isRead ? '#ffffff' : '#fff5f5', item.isRead ? '#ffffff' : '#fff5f5']}
                className="flex-row items-center p-4"
            >
                <StyledView className="bg-white dark:bg-neutral-800 p-2 rounded-full">
                    <StyledIonicons
                        name={getNotificationIcon(item.type)}
                        size={24}
                        color={getIconColor(item.type)}
                    />
                </StyledView>

                <StyledView className="flex-1 ml-3">
                    <StyledText className="font-custom text-base dark:text-white">
                        {item.content}
                    </StyledText>
                    <StyledText className="font-custom text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(item.timestamp)}
                    </StyledText>
                </StyledView>

                {!item.isRead && (
                    <StyledView className="h-3 w-3 rounded-full bg-red-500 ml-2" />
                )}
            </LinearGradient>
        </StyledTouchableOpacity>
    );

    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-neutral-900">
            <HeaderApp back={
                backPage
            } />

            <StyledScrollView
                className="flex-1 pt-5"
                showsVerticalScrollIndicator={false}
            >
                {
                    notifications.length > 0 ? notifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                            {renderNotification({ item: notification })}
                        </React.Fragment>
                    )) : (
                        <>
                            {loading ? (
                                <StyledView className="flex-1 justify-center items-center">
                                    <ActivityIndicator size="large" color="#EB3834" />
                                </StyledView>
                            ) : (
                                <StyledView className="flex-1 justify-center items-center h-full">
                                    <StyledText className="text-gray-500 dark:text-white font-custom mt-5">
                                        ไม่มีการแจ้งเตือนใดๆ
                                    </StyledText>
                                </StyledView>
                            )}
                        </>
                    )
                }
                <StyledView className="h-32" />
            </StyledScrollView>
        </StyledView>
    );
}
