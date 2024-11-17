import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { styled } from "nativewind";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types";
import { ScrollView } from "react-native-gesture-handler";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const iconFriend1 = require("../../assets/icon/A1.png");
const iconFriend2 = require("../../assets/icon/A3.png");

const iconDJ1 = require("../../assets/icon/A2.png");
const iconDJ2 = require("../../assets/icon/A5.png");

const iconMusic1 = require("../../assets/icon/A7.png");
const iconMusic2 = require("../../assets/icon/A6.png");

const iconTable1 = require("../../assets/icon/A4.png");

const iconTicket1 = require("../../assets/icon/A10.png");

const iconCar1 = require("../../assets/icon/A8.png");
const iconCar2 = require("../../assets/icon/A9.png");




type CategorySearch = RouteProp<RootStackParamList, 'SearchCategory'>;
const StyledIcon = styled(Ionicons);
const StyledScrollView = styled(ScrollView);
export default function SearchCategory() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const router = useRoute<CategorySearch>()
    const { backPage } = router.params;

    return (
        <LinearGradient
            colors={['#EB3834', '#69140F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1"
        >
            <StyledScrollView className={`mt-10`}>

            <TouchableOpacity onPress={() => backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack()} className="absolute pt-[15] ml-4">
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <StyledView className="w-full px-8 items-center mt-10">
                    <StyledView className="flex-row">
                        <TouchableOpacity onPress={() => { navigation.navigate('Search', { searchType: "Friend"}) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-20 h-full" />
                            <StyledView className="absolute flex-row w-full items-center">
                                <StyledImage source={iconFriend1} className="absolute w-[130px] h-[130px] right-[28%]"></StyledImage>
                                <StyledImage source={iconFriend2} className="absolute w-[130px] h-[130px] left-[28%]"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">เพื่อนเที่ยว</StyledText>

                        </TouchableOpacity>

                        <TouchableOpacity disabled onPress={() => { navigation.navigate('Search', { searchType: "Friend" }) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute flex-row w-full items-center">
                                <StyledImage source={iconDJ1} className="absolute w-[130px] h-[130px] right-[20%]"></StyledImage>
                                <StyledImage source={iconDJ2} className="absolute w-[130px] h-[130px] left-[37%]"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">MC/DJ/พิธีกร</StyledText>

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-[0.50] h-[230px]" />

                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                        </TouchableOpacity>
                    </StyledView>

                    <StyledView className="flex-row">
                        <TouchableOpacity disabled onPress={() => { navigation.navigate('Search', { searchType: "Friend" }) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-20 h-full" />
                            <StyledView className="absolute flex-row w-full items-center">
                                <StyledImage source={iconMusic1} className="absolute w-[180px] h-[180px] bottom-[-75px]"></StyledImage>
                                <StyledImage source={iconMusic2} className="absolute w-[130px] h-[130px] bottom-[-50px] left-[40%] rotate-12"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">วงดนตรี/นักร้อง</StyledText>

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-[0.50] h-[230px]" />

                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>

                        </TouchableOpacity>

                        <TouchableOpacity disabled onPress={() => { navigation.navigate('Search', { searchType: "Friend" }) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute w-full justify-center items-center">
                                <StyledImage source={iconTable1} className="absolute w-[230px] h-[230px] bottom-[-95px]"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">จองโต๊ะ</StyledText>

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-[0.50] h-[230px]" />

                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                        </TouchableOpacity>
                    </StyledView>

                    <StyledView className="flex-row">
                        <TouchableOpacity disabled onPress={() => { navigation.navigate('Search', { searchType: "Friend" }) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-20 h-full" />
                            <StyledView className="absolute justify-center w-full items-center">
                                <StyledImage source={iconTicket1} className="w-[130px] h-[130px] right-1.5"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">Concert</StyledText>

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-[0.50] h-[230px]" />

                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>

                        </TouchableOpacity>

                        <TouchableOpacity disabled onPress={() => { navigation.navigate('Search', { searchType: "Friend" }) }} className="w-6/12 rounded-2xl h-[230px] justify-center m-2">

                            <StyledView className="absolute justify-center w-full ">
                                <StyledImage source={iconCar1} className="absolute self-center w-[200px] h-[200px] right-[-5%]"></StyledImage>
                                <StyledImage source={iconCar2} className="absolute self-center w-[90px] h-[90px] bottom-2 left-[15%]"></StyledImage>
                            </StyledView>

                            <StyledText className="absolute self-center font-custom text-white text-xl bottom-4">FDrive</StyledText>

                            <StyledView className="absolute w-full bg-black rounded-2xl opacity-[0.50] h-[230px]" />

                            <StyledText className="self-center text-center font-custom text-white text-2xl">SOON</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>



            </StyledScrollView>
        </LinearGradient>
    );
}