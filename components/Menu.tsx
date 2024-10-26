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


export const Navigation = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const Menus = [
        { name: "Home", icon: "home-outline", active: "home", screen: "FeedsTab", iconType: "Ionicons" },
        { name: "Search", icon: "search-outline", active: "search-sharp", screen: "SearchCategory", iconType: "Ionicons" },
        { name: "Now", icon: "bolt-lightning", active: "bolt-lightning", screen: "NowTab", iconType: "FontAwesome6" },
        { name: "Schedule", icon: "calendar-outline", active: "calendar-sharp", screen: "ScheduleTab", iconType: "Ionicons" },
        { name: "Message", icon: "chatbubble-ellipses-outline", active: "chatbubble-ellipses-sharp", screen: "MessageTab", iconType: "Ionicons" },
    ];

    const [active, setActive] = useState(0);

    const handlePress = (index: number, screen: string) => {
        setActive(index);
        navigation.navigate(screen);
    };



    // return (

    //     // <StyledView className="bg-white w-full absolute bottom-0 shadow-sm"

    //     // style={{
    //     //     height:80,
    //     //     borderTopRightRadius: 20,
    //     //     borderTopLeftRadius: 20,
    //     // }}


    //     // >
    //     //     <StyledView className="flex-row relative justify-between">
    //     //         {Menus.map((menu, i) => (
    //     //             <Pressable key={i} onPress={() => handlePress(i, menu.screen)} className="w-2/12">
    //     //                 <StyledView className="items-center pb-3 pt-4">
    //     //                     {menu.iconType === "Ionicons" ? (
    //     //                         <Ionicons
    //     //                             name={i === active ? menu.active : menu.icon as any} 
    //     //                             size={24}
    //     //                             className="text-black"
    //     //                         />
    //     //                     ) : (
    //     //                         <FontAwesome6
    //     //                             name={i === active ? menu.active : menu.icon}
    //     //                             size={24}
    //     //                             className="text-black"
    //     //                         />
    //     //                     )}
    //     //                 </StyledView>
    //     //             </Pressable>
    //     //         ))}
    //     //     </StyledView>
    //     // </StyledView>
    // );
    return (
        <>
            
        </>
    )
};