import { RootStackParamList } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";



const StyledView = styled(View)
const StyledText = styled(Text)
const StyledIonicons = styled(Ionicons)
export default function SelectRegisterPage() {
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    return (
        <>
            <StyledView className="bg-white dark:bg-neutral-900 flex-1">

                <StyledText className="font-custom text-xl font-bold text-gray-900 dark:text-white text-center mt-16">เงื่อนไขและข้อตกลง</StyledText>
                <StyledText className="font-custom text-xl font-bold text-gray-900 dark:text-white text-center">Friend Zone</StyledText>
                <StyledView className="absolute mt-[70px] left-5">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute ml-4">
                        <StyledIonicons name="chevron-back" size={24} className='text-black dark:text-neutral-200' />
                    </TouchableOpacity>
                </StyledView>
            </StyledView>
        </>
    )
}
