import React, {useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Platform,
    KeyboardAvoidingView,
    Image,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderApp } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledIonicons = styled(Ionicons);

type NotificationType = 'like' | 'comment' | 'appointment' | 'message' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    content: string;
    timestamp: string;
    isRead: boolean;
    data: {
        postId?: string;
        appointmentId?: string;
        chatId?: string;
        userId?: string;
    };
    user?: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface Props {
    navigation: NavigationProp<any>;
}

export default function NotificationsScreen({ navigation }: Props) {
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'appointment',
            content: 'ต้องการนัดเจอกันที่ร้านกาแฟ',
            timestamp: '2024-12-05T10:30:00',
            isRead: false,
            data: { appointmentId: '123' },
            user: {
                id: '1',
                name: 'John Doe',
                avatar: '/api/placeholder/40/40',
            },
        },
        {
          id: '2',
          type: 'system',
          content: 'การนัดหมายของคุณกับ Sarah จะเริ่มในอีก 1 ชั่วโมง',
          timestamp: '2024-12-05T09:15:00',
          isRead: false,
          data: { appointmentId: '124' },
        },
        {
          id: '3',
          type: 'message',
          content: 'แสดงความคิดเห็นในโพสต์ของคุณ',
          timestamp: '2024-12-04T15:20:00',
          isRead: true,
          data: { chatId: '456' },
          user: {
            id: '2',
            name: 'Jane Smith',
            avatar: '/api/placeholder/40/40',
          },
        },
        {
          id: '4',
          type: 'like',
          content: 'ถูกใจโพสต์ของคุณ',
          timestamp: '2024-12-04T12:00:00',
          isRead: true,
          data: { postId: '789' },
          user: {
            id: '3',
            name: 'Mike Wilson',
            avatar: '/api/placeholder/40/40',
          },
        },
    ]);

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
                navigation.navigate('SchedulePage', { id: notification.data.appointmentId });
                break;
            case 'message':
                navigation.navigate('Chat', { id: notification.data.chatId });
                break;
            case 'like':
            case 'comment':
                navigation.navigate('Post', { id: notification.data.postId });
                break;
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <StyledTouchableOpacity
            className={`mx-3 my-1 rounded-2xl overflow-hidden ${item.isRead ? 'bg-white dark:bg-neutral-900' : 'bg-red-50 dark:bg-neutral-800'}`}
            onPress={() => handlePress(item)}
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="flex-1 bg-gray-50 dark:bg-black">
                <HeaderApp />
                
                <StyledView className="px-4 py-3">
                    <StyledText className="font-custom text-2xl dark:text-white">
                        การแจ้งเตือน
                    </StyledText>
                </StyledView>

                <StyledScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                >
                    {notifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                            {renderNotification({ item: notification })}
                        </React.Fragment>
                    ))}
                    <StyledView className="h-32" />
                </StyledScrollView>
            </StyledView>
        </KeyboardAvoidingView>
    );
}