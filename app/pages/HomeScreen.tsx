import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import Chat from "../screen/Chat";
import AccountSetting from "../screen/SettingAccount";
import ProfileMember from "../screen/ProfileMember";
import ScheduleList from "../screen/ScheduleList";
import Policy from "../screen/Policy";
import SettingImagePreview from "../screen/SettingImagePreview";
import SettingImagePreviewFirst from "../screen/SettingImagePreviewFirst";

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [pageLoading, setPageLoading] = useState(true);
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
        <Tab.Screen name="AccountSetting" component={AccountSetting} options={{ headerShown: false }} />
        <Tab.Screen name="ProfileMember" component={ProfileMember} options={{ headerShown: false }} />
        <Tab.Screen name="ScheduleList" component={ScheduleList} options={{ headerShown: false }} />
        <Tab.Screen name="Policy" component={Policy} options={{ headerShown: false }} />
        <Tab.Screen name="SettingImagePreview" component={SettingImagePreview} options={{ headerShown: false }} />
        <Tab.Screen name="SettingImagePreviewFirst" component={SettingImagePreviewFirst} options={{ headerShown: false }} />
      </Tab.Navigator>
    </>
  );
}
