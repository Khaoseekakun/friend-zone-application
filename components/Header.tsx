import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";

const StyledView = styled(View);
const StyledText = styled(Text);

export const HeaderApp = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <StyledView className="absolute w-full top-0 bg-white py-2">
            <StyledView className="w-full flex-row items-center justify-between">

                <TouchableOpacity className="flex-1 flex-row left-0" onPress={() => navigation.navigate('ProfileTab')}>
                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[42px] h-[42px]">

                    </StyledView>
                    <StyledView className="ml-3">

                        <StyledText className="font-bold text-lg">
                            Friend Zone
                        </StyledText>
                        <StyledText>
                            UserName
                        </StyledText>
                    </StyledView>
                </TouchableOpacity>

                <StyledView className="mr-3 flex-row items-center">
                    <StyledText className="mr-2 text-lg">
                        นครราชสีมา {/* Make sure this text is wrapped in StyledText */}
                    </StyledText>
                    <Ionicons
                        name="settings"
                        size={24}
                        color="black"
                        onPress={() => navigation.navigate('SettingTab')}
                        accessibilityLabel="Settings"
                    />
                </StyledView>
            </StyledView>
        </StyledView>
    );
};
