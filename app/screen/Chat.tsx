import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";

// Adjust the URL to your server’s address
const SERVER_URL = "https://friendszone.app/api/socketio";




import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { RootStackParamList } from "@/types";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)

type PostUpdateParam = RouteProp<RootStackParamList, 'Chat'>;

export default function Chat() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);
    const router = useRoute<PostUpdateParam>();
    const { chatId, chatName, helper } = router.params;
    return (
        <StyledView className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className="flex-1 bg-white">
                    <StyledView className="bg-white px-3 text-center pt-[60px] pb-3">
                        <TouchableOpacity onPress={() => navigation.navigate("MessageTab")} className="absolute pt-[60] ml-4">
                            <Ionicons name="chevron-back" size={24} color="" />
                        </TouchableOpacity>
                        <StyledText className="text-center self-center text-lg font-bold text-black">{chatName}</StyledText>
                    </StyledView>
                    <StyledView className="w-full px-5 mt-2 h-full">
                        
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView>
        </StyledView>
    );
}