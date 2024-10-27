import React from "react";
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

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
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
      </Tab.Navigator>
    </>
  );
}
