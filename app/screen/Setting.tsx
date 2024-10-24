import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { Navigation } from "@/components/Menu";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";

import * as Updates from 'expo-updates'
import AsyncStorage from "@react-native-async-storage/async-storage";
const StyledView = styled(View);
const StyledText = styled(Text);

export default function Setting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(false);

    const Logout = async () => {
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
        await Updates.reloadAsync(); 
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="flex-1 bg-white">
                <StyledView className="bg-gray-50 px-3 text-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="pt-5 ml-4">
                        <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                    </TouchableOpacity>
                    <StyledText className="text-center self-center text-lg font-bold py-3">การตั้งค่า</StyledText>
                </StyledView>
                
                <StyledView className="flex-1 justify-center items-center">
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity onPress={Logout} className="bg-blue-500 rounded p-3">
                            <StyledText className="text-white">Logout</StyledText>
                        </TouchableOpacity>
                    )}
                </StyledView>

                <Navigation />
            </StyledView>
        </KeyboardAvoidingView>
    );
}
