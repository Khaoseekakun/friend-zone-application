import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Image } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

import { styled } from "nativewind";
import axios from "axios";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const FriendImage = require("../../assets/images/InApp/friends.jpg");
const DjImage = require("../../assets/images/InApp/dj.jpg");
const MusicImage = require("../../assets/images/InApp/musicband.jpg");
const StyledIcon = styled(Ionicons);
export default function Message() {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <StyledView className="flex-1">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-1 justify-center items-center"
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[60] left-0 top-0 ml-4">
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <StyledView className="w-10/12 rounded-full h-[100px] justify-center border-[2px] border-white shadow-md my-2">

                        <StyledImage source={FriendImage} className="w-full rounded-full  h-[96px] justify-center " />

                        <StyledView className="absolute w-full bg-black rounded-full opacity-40 h-[96px]" />

                        <StyledView className="absolute self-center">
                            <StyledIcon className="self-center text-center font-custom text-white" name="people" size={35} color="white" />
                            <StyledText className="self-center text-center font-custom text-white text-2xl">เพื่อนเที่ยว</StyledText>
                        </StyledView>

                    </StyledView>

                    <StyledView className="w-10/12 rounded-full h-[100px] justify-center border-[2px] border-white shadow-md my-2">

                        <StyledImage source={DjImage} className="w-full rounded-full  h-[96px] justify-center " />

                        <StyledView className="absolute w-full bg-black rounded-full opacity-[0.85] h-[96px]" />



                        <StyledView className="absolute self-center">
                            <StyledIcon className="self-center text-center font-custom text-white" name="hammer" size={25} color="white" />
                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                        </StyledView>

                    </StyledView>

                    <StyledView className="w-10/12 rounded-full h-[100px] justify-center border-[2px] border-white shadow-md my-2">

                        <StyledImage source={MusicImage} className="w-full rounded-full  h-[96px] justify-center " />

                        <StyledView className="absolute w-full bg-black rounded-full opacity-[0.85] h-[96px]" />



                        <StyledView className="absolute self-center">
                            <StyledIcon className="self-center text-center font-custom text-white" name="hammer" size={25} color="white" />
                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                        </StyledView>

                    </StyledView>

                    <StyledText className="absolute self-center text-center top-14 font-custom text-white text-2xl">หมวดหมู่ค้นหา</StyledText>


                </LinearGradient>


            </KeyboardAvoidingView>
            <Navigation current="SearchCategory" />
        </StyledView>
    );
}