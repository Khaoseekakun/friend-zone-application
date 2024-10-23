import React from "react";
import { View, Text } from "react-native";
import { styled } from "nativewind";
import { Navigation } from "@/components/Menu";
import { HeaderApp } from "@/components/Header";
const StyledView = styled(View);
const StyledText = styled(Text);

export default function Setting() {

    return (
        <StyledView className="flex-1 bg-blue-200">
            <HeaderApp/>
            <StyledText>TEST</StyledText>
            
            <Navigation />
        </StyledView>
    );
}
