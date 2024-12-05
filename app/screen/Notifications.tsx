import React, { useState } from "react";
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
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { NavigationProp } from "@react-navigation/native";

interface Notification {
  id: number;
  username: string;
  action: string;
  timestamp: string;
  type: 'like' | 'follow' | 'comment' | 'tag';
  read: boolean;
}

interface NotificationGroups {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

interface NotificationPageProps {
  navigation: NavigationProp<any>;
}

// ฟังก์ชันสำหรับแปลงเวลา
const formatNotificationTime = (dateString: string): string => {
  const now: Date = new Date();
  const date: Date = new Date(dateString);
  const diffTime: number = now.getTime() - date.getTime();
  const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours: number = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes: number = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) return 'เมื่อสักครู่';
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// ฟังก์ชันสำหรับจัดกลุ่มการแจ้งเตือนตามวัน
const groupNotificationsByDate = (notifications: Notification[]): NotificationGroups => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return notifications.reduce((groups: NotificationGroups, notification: Notification) => {
    const notifDate = new Date(notification.timestamp);

    if (notifDate >= today) {
      groups.today.push(notification);
    } else if (notifDate >= yesterday) {
      groups.yesterday.push(notification);
    } else if (notifDate >= lastWeek) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }

    return groups;
  }, { today: [], yesterday: [], thisWeek: [], older: [] });
};

export default function NotificationPage({ navigation }: NotificationPageProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      username: "username_1",
      action: "ถูกใจรูปภาพของคุณ",
      timestamp: "2024-12-05T13:20:12",
      type: "like",
      read: false,
    },
    {
      id: 2,
      username: "another_user",
      action: "เริ่มติดตามคุณ",
      timestamp: "2024-12-04T10:15:00",
      type: "follow",
      read: false,
    },
    {
      id: 3,
      username: "user_3",
      action: "แสดงความคิดเห็นในโพสต์ของคุณ: 'สวยมากเลย! 🔥'",
      timestamp: "2024-12-03T08:30:00",
      type: "comment",
      read: true,
    },
    {
      id: 4,
      username: "username_4",
      action: "แท็กคุณในโพสต์",
      timestamp: "2024-11-30T15:45:00",
      type: "tag",
      read: true,
    },
  ]);

  const groupedNotifications = groupNotificationsByDate(notifications);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: isIOS ? 8 : 16,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: isDarkMode ? "#333" : "#ddd",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: isDarkMode ? "white" : "black",
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#000",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    unreadNotification: {
      backgroundColor: isDarkMode ? "#111" : "#fafafa",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      backgroundColor: "#ddd",
    },
    contentContainer: {
      flex: 1,
    },
    usernameText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#000",
    },
    actionText: {
      fontSize: 13,
      color: isDarkMode ? "#bbb" : "#666",
      flex: 1,
    },
    timeText: {
      fontSize: 12,
      color: isDarkMode ? "#666" : "#999",
      marginTop: 4,
    },
  });

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification,
      ]}
    >
      <Image
        source={{ uri: "/api/placeholder/44/44" }}
        style={styles.avatar}
      />
      <View style={styles.contentContainer}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Text style={styles.usernameText}>{notification.username}</Text>
          <Text style={styles.actionText}>{" " + notification.action}</Text>
        </View>
        <Text style={styles.timeText}>
          {formatNotificationTime(notification.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, notifications) => {
    if (notifications.length === 0) return null;
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {notifications.map(renderNotificationItem)}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft
                size={28}
                color={isDarkMode ? "white" : "black"}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
          </View>
        </View>

        <ScrollView>
          {renderSection("วันนี้", groupedNotifications.today)}
          {renderSection("เมื่อวาน", groupedNotifications.yesterday)}
          {renderSection("สัปดาห์นี้", groupedNotifications.thisWeek)}
          {renderSection("ก่อนหน้านี้", groupedNotifications.older)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}