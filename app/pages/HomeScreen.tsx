import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Alert } from "react-native";
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
import ScheduleList from "../screen/ScheduleList";
import Policy from "../screen/Policy";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions, useNavigation } from "@react-navigation/native";
import PostView from "../screen/PostView";
import NotificationPage from "../screen/Notifications";
import SettingPassword from "../screen/SettingPassword";
import AccountStatus from "../screen/AccountStatus";
import History from "../screen/History";
import SettingSecurity from "../screen/SettingSecurity";
import SettingDeleteAccount from "../screen/SettingDeleteAccount";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const [userData, setuUserData] = useState<any>({});
  const navigation = useNavigation<any>();
  const [deviceId, setDeviceId] = useState('');

  const getDeviceId = async () => {
    return await AsyncStorage.getItem('uuid') as string;
  };

  useEffect(() => {
    // Add notification response listener
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

  const fetchUserData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    setuUserData(JSON.parse(userData || '{}'));
  };

  useEffect(() => {
    (async () => {
      setDeviceId(await getDeviceId())
    })()
    fetchUserData();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (userData && userData.id && userData.token) {
        await axios.put('https://friendszone.app/api/notification/', {
          userId: userData?.id,
          notificationToken: token,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `All ${userData?.token}`, // Add a space after 'All'
          },
        });
      }
    } catch (error) {
      console.log('Error in notification permissions:', error);
    }
  };

  const Logout = async () => {
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userToken');
    const resetAction = StackActions.replace("Login")
    navigation.dispatch(resetAction);
  }

  const checkOtherLogin = async () => {
    if (deviceId && userData.id) {
      try {
        const res = await axios.get(`http://49.231.43.37:3000/api/oauth/login?deviceId=${deviceId}&userId=${userData.id}`, {
          headers: {
            'Authorization': `All ${userData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.data.status == 200) {
          // no other login
        } else {
          Alert.alert('บัญชีของคุณถูกใช้งานจากอุปกรณ์อื่น', 'กรุณาเข้าสู่ระบบใหม่', [
            {
              text: 'ตกลง',
              onPress: async () => {
                Logout()
              }
            }
          ])
        }

      } catch (error) {
        console.log('Error in checking other login:', error);
      }
    }
  }

  //checkOtherLogin check every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkOtherLogin();
    }, 1000*60);

    return () => clearInterval(interval);
  }, [userData]);

  useEffect(() => {
    checkNotificationPermissions();
  }, [userData]);

  return (
    <>
      <Tab.Navigator tabBar={() => null}>
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
        <Tab.Screen name="ScheduleList" component={ScheduleList} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="Policy" component={Policy} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="PostView" component={PostView} options={{ headerShown: false, animation: "fade" }} />
        <Tab.Screen name="Notification" component={NotificationPage} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SettingPassword" component={SettingPassword} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="AccountStatus" component={AccountStatus} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="History" component={History} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SettingSecurity" component={SettingSecurity} options={{ headerShown: false, animation: "shift" }} />
        <Tab.Screen name="SettingDeleteAccount" component={SettingDeleteAccount} options={{ headerShown: false, animation: "shift" }} />
      </Tab.Navigator>
    </>
  );
}
