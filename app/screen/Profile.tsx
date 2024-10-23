import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";
import { Navigation } from "@/components/Menu";
import { HeaderApp } from "@/components/Header";
const StyledView = styled(View);
const StyledText = styled(Text);

export default function HomeScreen() {

    return (
        <StyledView className="flex-1 bg-red-200">
            <HeaderApp/>
            
            <Navigation />
        </StyledView>
    );
}
