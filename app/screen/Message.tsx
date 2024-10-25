import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { styled } from "nativewind";
import { Navigation } from "@/components/Menu";
import { HeaderApp } from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)
export default function Message() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    return (
        <StyledView className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className="flex-1 bg-white">
                    <StyledView className="bg-white px-3 text-center pt-[60px] pb-3">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[60] ml-4">
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <StyledText className="text-center self-center text-lg font-bold text-black">Chats</StyledText>
                    </StyledView>

                    {/* Search */}
                    <StyledView className="w-full px-5 mt-2">
                        <StyledTextInput
                            placeholder="คุณกำลังคิดอะไรอยู่?"
                            className="py-3 w-full bg-gray-100 rounded-full text-lg px-9"
                            value={search}
                            onChangeText={setSearch}
                            inputMode='text'
                            multiline={true}
                            numberOfLines={5}
                            maxLength={50}
                        >
                        </StyledTextInput>

                        <StyledIonIcon name="search" size={24} color="#000" className="pl-8 absolute mt-3" />
                        {search.length > 0 && (
                            <StyledView className="right-8 absolute mt-3 bg-gray-50 rounded-full ">
                                <StyledIonIcon name="close" size={24} color="#000" className="" onPress={() => setSearch('')}/>
                            </StyledView>
                        )}
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView>
        </StyledView>
    );
}
