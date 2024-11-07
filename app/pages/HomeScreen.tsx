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
      </Tab.Navigator>
    </>
  );
}
