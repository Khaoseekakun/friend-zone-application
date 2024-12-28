import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image, Platform } from "react-native";
import { styled } from "nativewind";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "@/types";
import { getDatabase, ref, onValue } from "firebase/database";
import FireBaseApp from "@/utils/firebaseConfig";
const WhiteLogo = require("../assets/images/guesticon.jpg")
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image)
const StyledIonicons = styled(Ionicons)
interface HeaderAppProps {
    back?: any;
    searchType?: string;
}

export const HeaderApp: React.FC<HeaderAppProps> = ({ back, searchType }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [userData, setuserData] = useState<any>();
    const database = getDatabase(FireBaseApp);
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, []);
    const [notReadNotificationCount, setNotReadNotificationCount] = useState(0);

    useEffect(() => {
        //firebase realtime database notification
        if (userData?.id) {
            const refNoti = ref(database, `notifications/${userData?.id}`);
            //check notification is isRead is have false 
            onValue(refNoti, (snapshot: any) => {
                const data = snapshot.val();
                if (data) {
                    const noti = Object.values(data).filter((item: any) => item.isRead == false);
                    setNotReadNotificationCount(noti.length);
                }
            });
        }
    }, [userData])

    return (
        <LinearGradient
            colors={['#EB3834', '#69140F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className={`w-full top-0 ${Platform.OS == "ios" ? "h-[106px]" : "h-[106px]"} `}
        >
            <StatusBar barStyle={'light-content'}></StatusBar>
            <StyledView className={`w-full flex-row items-center justify-between ${Platform.OS == "ios" ? "mt-12" : "mt-12"}`}>
                {
                    back && (
                        <StyledView className="">
                            <TouchableOpacity
                                onPress={() => navigation.navigate(back, { searchType })}
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
                            uri: userData?.profileUrl
                        } :
                            WhiteLogo

                    }>

                    </StyledImage>
                    <StyledView className="">

                        <StyledText className="font-bold font-custom text-lg text-white">
                            Friend Zone
                        </StyledText>
                        <StyledText className="text-white font-bold font-custom absolute mt-6">
                            {userData?.username}
                        </StyledText>
                    </StyledView>
                </TouchableOpacity>

                <StyledView className="mr-3 flex-row items-center gap-2">
                    <StyledView>
                        <StyledIonicons
                            name="notifications"
                            size={24}
                            color="white"
                            onPress={() => navigation.navigate('Notification', {
                                backPage: navigation.getState().routes[navigation.getState().index].name
                            })}
                            accessibilityLabel="Settings"
                        />
                        {
                            notReadNotificationCount > 0 && (
                                <StyledView className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                                    <StyledText className="text-white text-xs font-bold">{notReadNotificationCount}</StyledText>
                                </StyledView>
                            )
                        }
                    </StyledView>
                    <StyledIonicons
                        name="settings"
                        size={24}
                        color="white"
                        onPress={() => navigation.navigate('SettingTab', {})}
                        accessibilityLabel="Settings"
                    />
                </StyledView>
            </StyledView>
        </LinearGradient>
    );
};
