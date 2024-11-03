import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, StackActions } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);

export default function AccountSetting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [userData, setuserData] = useState<any>();

    useEffect(() => {
        
        try {
            fetchUserData();
        } finally {
            setLoading(false);
        }
       

    }, []);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        setuserData(JSON.parse(userData as string) || {});
    };
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="w-full flex-1 bg-white">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="text-center top-0 h-[92px] justify-center"
                >
                    <StyledView className="mt-5">
                        <TouchableOpacity onPress={() => navigation.navigate("SettingTab")} className="absolute ml-4">
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">ตั้งค่าบัญชี</StyledText>
                    </StyledView>
                </LinearGradient>
                <ScrollView>
                    {
                        loading ? <ActivityIndicator size="large" color="#EB3834" style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            top: "100%"
                        }} /> :
                            (
                                <>
                                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                                        <StyledText className=" text-gray-500 font-custom">บัญชีของคุณ</StyledText>
                                    </StyledView>

                                    <TouchableOpacity onPress={() => { }}>
                                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                                            <StyledView className="flex-row items-center">
                                                <StyledIonicons name="person-circle-outline" size={24} color="black" className="" />
                                                <StyledView className="ml-2">
                                                    <StyledText className=" text-gray-700 font-custom text-lg">เปลี่ยนชื่อบัญชี</StyledText>
                                                </StyledView>
                                            </StyledView>

                                            <StyledIonicons name="pencil" size={18} color="gray" />
                                        </StyledView>
                                        <StyledView className="w-full h-1.5 bg-gray-100"></StyledView>
                                    </TouchableOpacity>
                                    </>
                            )
                    }

                </ScrollView>
            </StyledView>
        </KeyboardAvoidingView >
    );
}
