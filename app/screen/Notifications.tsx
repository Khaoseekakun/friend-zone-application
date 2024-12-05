import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { ChevronLeft, Heart, MessageCircle, Calendar, Bell } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';

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
  const isDark = useColorScheme() === 'dark';
  const isIOS = Platform.OS === 'ios';

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart size={20} color="#FF4B4B" />;
      case 'comment':
        return <MessageCircle size={20} color="#4B7BFF" />;
      case 'appointment':
        return <Calendar size={20} color="#47C479" />;
      case 'message':
        return <MessageCircle size={20} color="#9B51E0" />;
      case 'system':
        return <Bell size={20} color="#FFA726" />;
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
    // ตรวจสอบประเภทและนำทางไปยังหน้าที่เกี่ยวข้อง
    switch (notification.type) {
      case 'appointment':
        navigation.navigate('AppointmentDetail', { id: notification.data.appointmentId });
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

  const notifications: Notification[] = [
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
      content: 'ส่งข้อความถึงคุณ',
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
  ];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: isIOS ? 8 : 16,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? '#333' : '#ddd',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
      marginLeft: 12,
    },
    notificationContainer: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#222' : '#f5f5f5',
      backgroundColor: isDark ? '#000' : '#fff',
    },
    unread: {
      backgroundColor: isDark ? '#111' : '#f8f8f8',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    systemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    name: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: isDark ? '#bbb' : '#666',
      marginBottom: 4,
    },
    time: {
      fontSize: 12,
      color: isDark ? '#666' : '#999',
    },
    iconContainer: {
      position: 'absolute',
      bottom: -6,
      right: 8,
      backgroundColor: isDark ? '#000' : '#fff',
      borderRadius: 12,
      padding: 4,
      borderWidth: 1.5,
      borderColor: isDark ? '#333' : '#eee',
    },
  });

  const NotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationContainer, !item.isRead && styles.unread]}
      onPress={() => handlePress(item)}
    >
      {item.type === 'system' ? (
        <View style={styles.systemIcon}>
          {getNotificationIcon(item.type)}
        </View>
      ) : (
        <View>
          <Image source={{ uri: item.user?.avatar }} style={styles.avatar} />
          <View style={styles.iconContainer}>
            {getNotificationIcon(item.type)}
          </View>
        </View>
      )}
      <View style={styles.content}>
        {item.user && <Text style={styles.name}>{item.user.name}</Text>}
        <Text style={styles.message}>{item.content}</Text>
        <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        </View>
        <ScrollView>
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} item={notification} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}