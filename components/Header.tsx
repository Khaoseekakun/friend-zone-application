import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { styled } from "nativewind";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const GuestIcon = require("../assets/images/guesticon.jpg")
const StyledView = styled(View);
const StyledText = styled(Text);

export const HeaderApp = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [userData, setuserData] = useState<any>();

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, []);
    return (
        <StyledView className="w-full top-0 bg-[#69140F] h-[106px]">
            <StatusBar hidden></StatusBar>
            <StyledView className="w-full flex-row items-center justify-between mt-12">
                <TouchableOpacity className="flex-1 flex-row left-0 shadow-md" onPress={() => navigation.navigate('ProfileTab')}>
                    <Image className="ml-3 bg-gray-400 rounded-full w-[42px] h-[42px]" source={
                        userData?.avatar ? { uri: userData?.avatar } : GuestIcon
                    }>

                    </Image>
                    <StyledView className="ml-3">

                        <StyledText className="font-bold font-custom text-lg text-white">
                            Friend Zone
                        </StyledText>
                        <StyledText className="text-white font-custom">
                            {userData?.username}
                        </StyledText>
                    </StyledView>
                </TouchableOpacity>

                <StyledView className="mr-3 flex-row items-center">
                    <StyledText className="mr-2 text-lg text-white font-custom">
                        นครราชสีมา {/* Make sure this text is wrapped in StyledText */}
                    </StyledText>
                    <Ionicons
                        name="settings"
                        size={24}
                        color="white"
                        onPress={() => navigation.navigate('SettingTab')}
                        accessibilityLabel="Settings"
                    />
                </StyledView>
            </StyledView>
        </StyledView>
    );
};
