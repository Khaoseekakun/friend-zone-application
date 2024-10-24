import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { styled } from "nativewind";
import Profile from "../screen/Profile";

import { Navigation } from "@/components/Menu"; 
import { HeaderApp } from "@/components/Header";
import Message from "../screen/Message";
import Setting from "../screen/Setting";
import Feeds from "../screen/Feeds";
import Post from "../screen/Post";

const StyledView = styled(View);
const StyledText = styled(Text);

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <StyledView className="flex-1 bg-gray-200 dark:bg-gray-800 h-screen">
      <HeaderApp />
      <Tab.Navigator
        screenOptions={{
          headerShown: false, 
        }}
        tabBar={() => null} 
      >
        <Tab.Screen name="FeedsTab" component={Feeds}/>
        <Tab.Screen name="ProfileTab" component={Profile} />
        <Tab.Screen name="MessageTab" component={Message} />
        <Tab.Screen name="SettingTab" component={Setting} />
        <Tab.Screen name="PostTab" component={Post} />
      </Tab.Navigator>

    </StyledView>
  );
}
