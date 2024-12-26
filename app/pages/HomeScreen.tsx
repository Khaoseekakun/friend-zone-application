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
import { createStackNavigator } from "@react-navigation/stack";
import Privacy from "../screen/Privacy";
import FastRequest from "../screen/FastRequest";

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
        const res = await axios.get(`https://friendszone.app/api/oauth/login?deviceId=${deviceId}&userId=${userData.id}`, {
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
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [userData]);

  useEffect(() => {
    checkNotificationPermissions();
  }, [userData]);

  const Stack = createStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <>
        <Stack.Screen name="FeedsTab" component={Feeds} />
        <Stack.Screen name="MessageTab" component={Message} />
        <Stack.Screen name="SettingTab" component={Setting} />
        <Stack.Screen name="ProfileTab" component={Profile} />
        <Stack.Screen name="PostTab" component={Post} />
        <Stack.Screen name="PostUpdate" component={PostUpdate} />
        <Stack.Screen name="FastTab" component={Fast} />
        <Stack.Screen name="SearchCategory" component={SearchCategory} />
        <Stack.Screen name="SchedulePage" component={SchedulePage} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="AccountSetting" component={AccountSetting} />
        <Stack.Screen name="ScheduleList" component={ScheduleList} />
        <Stack.Screen name="Policy" component={Policy} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="PostView" component={PostView} />
        <Stack.Screen name="Notification" component={NotificationPage} />
        <Stack.Screen name="SettingPassword" component={SettingPassword} />
        <Stack.Screen name="AccountStatus" component={AccountStatus} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="SettingSecurity" component={SettingSecurity} />
        <Stack.Screen name="SettingDeleteAccount" component={SettingDeleteAccount} />
        <Stack.Screen name="FastRequest" component={FastRequest} />

      </>
    </Stack.Navigator>
  );
}
