import React, { useState } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { styled } from "nativewind";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons, {
    props: {
        name: true,
        size: true,
    },
});

const SyledAnimated = styled(Animated.View)

const StyledFontAwesome6 = styled(FontAwesome6, {
    props: {
        name: true,
        size: true,
    },
});

const { width } = Dimensions.get('window');

export const Menu = ({ current }: { current: string }) => {
    const menuItems: { name: string; icon: "home-outline" | "search-outline" | "heart-outline" | "chatbubble-outline" | "person-outline"; value: string }[] = [
        { name: "Home", icon: "home-outline", value: "home" },
        { name: "Search", icon: "search-outline", value: "search" },
        { name: "Favorites", icon: "heart-outline", value: "favorites" },
        { name: "Messages", icon: "chatbubble-outline", value: "messages" },
        { name: "Profile", icon: "person-outline", value: "profile" },
    ];

    return (
        <StyledView className="absolute w-full bottom-0 flex-row">
            <StyledView className="w-full self-center bg-white text-black flex-row justify-around p-2">
                {menuItems.map(item => (
                    <StyledView className="items-center" key={item.value}>
                        <StyledText className={current === item.value ? "font-bold" : ""}>
                            {item.name}
                        </StyledText>
                    </StyledView>
                ))}
            </StyledView>
            {menuItems.map(item => (
                <StyledView className="absolute w-full self-center text-black flex-row justify-around mb" key={item.value}>
                    <StyledIonicons name={item.icon} size={24} color="black" />
                </StyledView>
            ))}
        </StyledView>
    );
};