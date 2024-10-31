import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, StackActions } from "@react-navigation/native";

import * as Updates from 'expo-updates'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
const StyledView = styled(View);
const StyledText = styled(Text);

export default function Setting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);


    const Logout = async () => {
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
        const resetAction = StackActions.replace("Login")
        navigation.dispatch(resetAction);
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="w-full flex-1">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-3 text-center top-0 h-[106px]"
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[53px] ml-4">
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <StyledText className="absolute self-center text-lg font-bold text-white ">การตั้งค่า</StyledText>
                </LinearGradient>

                <StyledView className="flex-1 justify-center items-center">
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity onPress={Logout} className="bg-blue-500 rounded p-3">
                            <StyledText className="text-white">Logout</StyledText>
                        </TouchableOpacity>
                    )}
                </StyledView>
            </StyledView>
        </KeyboardAvoidingView >
    );
}
