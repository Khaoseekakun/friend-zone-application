import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image, Platform } from "react-native";
import { styled } from "nativewind";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
const WhiteLogo = require("../assets/images/guesticon.jpg")
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image)
interface HeaderAppProps {
    back?: string;
    searchType?: string;
}

export const HeaderApp: React.FC<HeaderAppProps> = ({ back, searchType }) => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [userData, setuserData] = useState<any>();
    const [province, setProvince] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            const province = await AsyncStorage.getItem('province');
            if (province) {
                setProvince(province);
            }
            setuserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, []);

    const HandleChangeProvince = async (province: string) => {
        try {
            await AsyncStorage.setItem('province', province);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <LinearGradient
            colors={['#EB3834', '#69140F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={`w-full top-0 ${Platform.OS == "ios" ? "h-[106px]" : "h-auto"}`}
        >
            <StatusBar barStyle={'light-content'}></StatusBar>
            <StyledView className={`w-full flex-row items-center justify-between ${Platform.OS == "ios" ? "mt-12" : "my-auto py-2"}`}>
                {
                    back && (
                        <StyledView className="">
                            <TouchableOpacity
                                onPress={() => navigation.navigate(back, { searchType})}
                                className="ml-1"
                            >
                                <Ionicons name="chevron-back" size={30} color="white" />
                            </TouchableOpacity>
                        </StyledView>
                    )
                }
                <TouchableOpacity className="flex-1 flex-row left-0 shadow-md" onPress={() => navigation.navigate('ProfileTab', { profileId: userData?.id })}>
                    <StyledImage className=" rounded-full w-[42px] h-[42px] m-1 border-white border-[2px]" source={
                        userData?.profileUrl ? {
                            uri : userData?.profileUrl 
                        } : 
                        WhiteLogo
                    
                    }>

                    </StyledImage>
                    <StyledView className="">

                        <StyledText className="font-bold font-custom text-lg text-white">
                            Friend Zone
                        </StyledText>
                        <StyledText className="text-white font-bold font-custom">
                            {userData?.username}
                        </StyledText>
                    </StyledView>
                </TouchableOpacity>

                <StyledView className="mr-3 flex-row items-center">
                    <StyledText className="mr-2 text-lg text-right text-white font-custom wrapper w-[100px] leading-5">
                        {/* {Nakhon Ratchasima} */}
                        {province ? province : userData?.province ?? "ไม่ระบุ"}
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
        </LinearGradient>
    );
};
