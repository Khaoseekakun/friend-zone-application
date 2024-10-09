import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import App from "@/app/(pages)";
import Search from "@/app/(pages)/search";
import Fast from "@/app/(pages)/fast";
import Message from "@/app/(pages)/message";
import Profile from "@/app/(pages)/profile";

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
    
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "home-outline";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Fast") {
            iconName = focused ? "flash" : "flash-outline";
          } else if (route.name === "Message") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons className="relative" name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={App} options={{headerShown : false}}/>
      <Tab.Screen name="Search" component={Search} options={{headerShown : false}}/>
      <Tab.Screen name="Fast" component={Fast} options={{headerShown : false}}/>
      <Tab.Screen name="Message" component={Message} options={{headerShown : false}}/>
      <Tab.Screen name="Profile" component={Profile} options={{headerShown : false}}/>
    </Tab.Navigator>
  );
};

export default Navigation;
