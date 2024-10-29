import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";

// Adjust the URL to your server’s address
const SERVER_URL = "https://friendszone.app/api/socketio";




import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)

export default function SchedulePage() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);

    const handlerMessageSearch = async() => {
        setSearchLoading(true);
        try {
            const searchMessage = await axios.get(`https://friendszone.app/api/message`)
        } catch (error) {

        } finally {
            setSearchLoading(false);
        }
    }


    return (
        <StyledView className="flex-1">
            <HeaderApp />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className="flex-1 bg-white dark:bg-black">
                </StyledView>
            </KeyboardAvoidingView>
            <Navigation current="SchedulePage"/>
        </StyledView>
    );
}