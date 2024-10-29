import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { styled } from "nativewind";
import Profile from "../screen/Profile";

import Message from "../screen/Message";
import Setting from "../screen/Setting";
import Feeds from "../screen/Feeds";
import Post from "../screen/Post";
import PostUpdate from "../screen/PostUpdate";
import SearchCategory from "../screen/SearchCategory";
import Fast from "../screen/Fast";
import SchedulePage from "../screen/SchedulePage";
import Search from "../screen/Search";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useFocusEffect } from "expo-router";
import Chat from "../screen/Chat";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  useFocusEffect(() => {
    // Check if the user is already logged in
    AsyncStorage.getItem('userToken').then(token => {
        if (!token) {
          navigation.navigate('Login');
        }
    });
})
  return (
    <>
      <Tab.Navigator tabBar={() => null} >
        <Tab.Screen name="FeedsTab" component={Feeds} options={{ headerShown: false }} />
        <Tab.Screen name="MessageTab" component={Message} options={{ headerShown: false }} />
        <Tab.Screen name="SettingTab" component={Setting} options={{ headerShown: false }} />
        <Tab.Screen name="ProfileTab" component={Profile} options={{ headerShown: false }} />
        <Tab.Screen name="PostTab" component={Post} options={{ headerShown: false }} />
        <Tab.Screen name="PostUpdate" component={PostUpdate} options={{ headerShown: false }} />
        <Tab.Screen name="FastTab" component={Fast} options={{ headerShown: false }} />
        <Tab.Screen name="SearchCategory" component={SearchCategory} options={{ headerShown: false }} />
        <Tab.Screen name="SchedulePage" component={SchedulePage} options={{ headerShown: false }} />
        <Tab.Screen name="Search" component={Search} options={{ headerShown: false }} />
        <Tab.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
      </Tab.Navigator>
    </>
  );
}
