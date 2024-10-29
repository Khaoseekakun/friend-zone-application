import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Image } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

import { styled } from "nativewind";
import axios from "axios";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const FriendImage = require("../../assets/images/InApp/friends.jpg");
const DjImage = require("../../assets/images/InApp/dj.jpg");
const MusicImage = require("../../assets/images/InApp/musicband.jpg");
const StyledIcon = styled(Ionicons);
export default function SearchCategory() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <StyledView className="flex-1">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient
                    colors={['#69140F', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="flex-1 justify-center items-center px-12"
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[60] left-0 top-0 ml-4">
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>

                    <StyledView className="flex-row">
                        <TouchableOpacity onPress={() => { navigation.navigate('Search', {searchType : "Friend"})}} className="w-6/12 rounded-3xl h-[220px] justify-center border-[2px] border-white shadow-md m-2">
                            <StyledImage source={FriendImage} className="w-full rounded-3xl  h-[216px] justify-center " />
                            <StyledView className="absolute w-full bg-black rounded-3xl opacity-40 h-[216px]" />
                            <StyledView className="absolute self-center">
                                <StyledIcon className="self-center text-center font-custom text-white" name="people" size={35} color="white" />
                                <StyledText className="self-center text-center font-custom text-white text-2xl">เพื่อนเที่ยว</StyledText>
                            </StyledView>
                        </TouchableOpacity>

                        <StyledView className="w-6/12 rounded-3xl h-[220px] justify-center border-[2px] border-white shadow-md m-2">
                            <StyledImage source={DjImage} className="w-full rounded-3xl  h-[216px] justify-center " />
                            <StyledView className="absolute w-full bg-black rounded-3xl opacity-[0.85] h-[216px]" />
                            <StyledView className="absolute self-center">
                                <StyledIcon className="self-center text-center font-custom text-white" name="hammer" size={25} color="white" />
                                <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                            </StyledView>
                        </StyledView>
                    </StyledView>

                    <StyledView className="flex-row">


                        <StyledView className="w-6/12 rounded-3xl h-[220px] justify-center border-[2px] border-white shadow-md m-2">
                            <StyledImage source={MusicImage} className="w-full rounded-3xl  h-[216px] justify-center " />
                            <StyledView className="absolute w-full bg-black rounded-3xl opacity-[0.85] h-[216px]" />
                            <StyledView className="absolute self-center">
                                <StyledIcon className="self-center text-center font-custom text-white" name="hammer" size={25} color="white" />
                                <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledView className="w-6/12 rounded-3xl h-[220px] justify-center border-[2px] border-white shadow-md m-2">
                            <StyledImage source={MusicImage} className="w-full rounded-3xl  h-[216px] justify-center " />
                            <StyledView className="absolute w-full bg-black rounded-3xl opacity-[0.85] h-[216px]" />
                            <StyledView className="absolute self-center">
                                <StyledIcon className="self-center text-center font-custom text-white" name="hammer" size={25} color="white" />
                                <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                            </StyledView>
                        </StyledView>
                    </StyledView>

                    <StyledText className="absolute self-center text-center top-14 font-custom text-white text-2xl">FriendZone</StyledText>


                </LinearGradient>


            </KeyboardAvoidingView>
            <Navigation current="SearchCategory" />
        </StyledView>
    );
}