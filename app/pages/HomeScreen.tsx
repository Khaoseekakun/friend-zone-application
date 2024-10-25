import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { styled } from "nativewind";
import Profile from "../screen/Profile";

import Message from "../screen/Message";
import Setting from "../screen/Setting";
import Feeds from "../screen/Feeds";
import Post from "../screen/Post";

const StyledView = styled(View);
const StyledText = styled(Text);

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
      </Tab.Navigator>
    </>
  );
}
