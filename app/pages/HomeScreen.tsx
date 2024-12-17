import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Profile from "../screen/Profile";
import * as Notifications from 'expo-notifications';
import Message from "../screen/Message";
import Setting from "../screen/Setting";
import Feeds from "../screen/Feeds";
import Post from "../screen/Post";
import PostUpdate from "../screen/PostUpdate";
import SearchCategory from "../screen/SearchCategory";
import Fast from "../screen/Fast";
import SchedulePage from "../screen/SchedulePage";
import Search from "../screen/Search";
import Chat from "../screen/Chat";
import AccountSetting from "../screen/SettingAccount";
import ProfileMember from "../screen/ProfileMember";
import ScheduleList from "../screen/ScheduleList";
import Policy from "../screen/Policy";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import PostView from "../screen/PostView";
import NotificationPage from "../screen/Notifications";
import SettingPassword from "../screen/SettingPassword";
import AccountStatus from "../screen/AccountStatus";
import History from "../screen/History";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {

  const [userData, setuUserData] = useState<any>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.screen) {
        navigation.navigate(data?.screen.name, data.screen.data);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      setuUserData(JSON.parse(userData || '{}'));
    };
    fetchUserData();


  }, []);

  const getDeviceId = async () => {
    return await AsyncStorage.getItem('uuid') as string;
  };

  useEffect(() => {
    const checkNotificationPermissions = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();

        const token = (await Notifications.getExpoPushTokenAsync({
          deviceId: await getDeviceId()
        })).data;

        if (userData && userData.id && userData.token) {
          await axios.put('https://friendszone.app/api/notification/', {
            userId: userData?.id,
            notificationToken: token
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'All ' + userData?.token, // Add a space after 'All'
            },
          });

        }
      } catch (error) {
        console.log('')
      }
    };

    checkNotificationPermissions();
  }, [userData]);

  return (
    <>
      <Tab.Navigator tabBar={() => null} >
        <Tab.Screen name="FeedsTab" component={Feeds} options={{ headerShown: false, animation: "fade" }} />
        <Tab.Screen name="MessageTab" component={Message} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SettingTab" component={Setting} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="ProfileTab" component={Profile} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="PostTab" component={Post} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="PostUpdate" component={PostUpdate} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="FastTab" component={Fast} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SearchCategory" component={SearchCategory} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SchedulePage" component={SchedulePage} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="Search" component={Search} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="Chat" component={Chat} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="AccountSetting" component={AccountSetting} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="ProfileMember" component={ProfileMember} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="ScheduleList" component={ScheduleList} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="Policy" component={Policy} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="PostView" component={PostView} options={{ headerShown: false, animation: "fade" }} />
        <Tab.Screen name="Notification" component={NotificationPage} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SettingPassword" component={SettingPassword} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="AccountStatus" component={AccountStatus} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="History" component={History} options={{ headerShown: false, animation: "shift" }} />

      </Tab.Navigator>
    </>
  );
}
