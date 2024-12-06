

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
const StyledScrollView = styled(ScrollView);

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

const categories = [
  {
    id: 'friend',
    title: 'เพื่อนเที่ยว',
    icons: [iconFriend1, iconFriend2],
    enabled: true,
    description: 'หาเพื่อนไปเที่ยวด้วยกัน'
  },
  {
    id: 'dj',
    title: 'MC/DJ/พิธีกร',
    icons: [iconDJ1, iconDJ2],
    enabled: false,
    description: 'จ้าง DJ หรือพิธีกรมืออาชีพ'
  },
  {
    id: 'music',
    title: 'วงดนตรี/นักร้อง',
    icons: [iconMusic1, iconMusic2],
    enabled: false,
    description: 'จ้างวงดนตรีสดหรือนักร้อง'
  },
  {
    id: 'table',
    title: 'จองโต๊ะ',
    icons: [iconTable1],
    enabled: false,
    description: 'จองโต๊ะร้านอาหารหรือสถานบันเทิง'
  },
  {
    id: 'concert',
    title: 'Concert',
    icons: [iconTicket1],
    enabled: false,
    description: 'จองบัตรคอนเสิร์ตและอีเวนต์'
  },
  {
    id: 'drive',
    title: 'FDrive',
    icons: [iconCar1, iconCar2],
    enabled: false,
    description: 'บริการรถรับ-ส่ง'
  }
];

type CategorySearch = RouteProp<RootStackParamList, 'SearchCategory'>;

export default function SearchCategory() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const router = useRoute<CategorySearch>();
    const { backPage } = router.params;

    return (
        <LinearGradient
            colors={['#EB3834', '#69140F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="flex-1"
        >
            <StyledScrollView className="flex-1 pt-12">
                {/* Header */}
                <StyledView className="px-6 pb-6">
                    <TouchableOpacity 
                        onPress={() => backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack()} 
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-4"
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <StyledText className="text-white text-3xl font-bold mb-2">
                        บริการของเรา
                    </StyledText>
                    <StyledText className="text-white/80 text-base">
                        เลือกบริการที่คุณต้องการ
                    </StyledText>
                </StyledView>

                {/* Categories Grid */}
                <StyledView className="px-4 pb-8">
                    <StyledView className="flex-row flex-wrap">
                        {categories.map((category) => (
                            <TouchableOpacity 
                                key={category.id}
                                disabled={!category.enabled}
                                onPress={() => {
                                    if (category.id === 'friend') {
                                        navigation.navigate('Search', { searchType: "Friend"});
                                    }
                                }}
                                className="w-1/2 p-2"
                            >
                                <StyledView className={`
                                    bg-white/10 rounded-3xl p-4 aspect-[4/5]
                                    ${!category.enabled ? 'opacity-50' : ''}
                                `}>
                                    {/* Icon Container */}
                                    <StyledView className="flex-1 relative justify-center items-center">
                                        {category.icons.map((icon, index) => (
                                            <StyledImage
                                                key={index}
                                                source={icon}
                                                className={`
                                                    w-[100px] h-[100px] absolute
                                                    ${index === 0 ? 'translate-x-4' : '-translate-x-4'}
                                                `}
                                            />
                                        ))}
                                    </StyledView>

                                    {/* Text Content */}
                                    <StyledView className="mt-4">
                                        <StyledText className="text-white text-lg font-bold mb-1">
                                            {category.title}
                                        </StyledText>
                                        <StyledText className="text-white/60 text-sm">
                                            {category.description}
                                        </StyledText>
                                        {!category.enabled && (
                                            <StyledView className="absolute top-0 right-0">
                                                <StyledText className="text-white/90 text-xs font-bold px-5 py-3 -mt-9 bg-white/20 rounded-full">
                                                    COMING SOON
                                                </StyledText>
                                            </StyledView>
                                        )}
                                    </StyledView>
                                </StyledView>
                            </TouchableOpacity>
                        ))}
                    </StyledView>
                </StyledView>
            </StyledScrollView>
        </LinearGradient>
    );
}