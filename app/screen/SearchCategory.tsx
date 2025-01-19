import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types";
import Animated, {
  FadeInDown,
  FadeInUp,
  withSpring
} from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { Platform } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Import your icons here
const iconFriend1 = require("../../assets/icon/A1.png");
const iconFriend2 = require("../../assets/icon/A3.png");
const iconDJ1 = require("../../assets/icon/A2.png");
const iconDJ2 = require("../../assets/icon/A5.png");
const iconMusic2 = require("../../assets/icon/A7.png");
const iconMusic1 = require("../../assets/icon/A6.png");
const iconTable1 = require("../../assets/icon/A4.png");
const iconTicket1 = require("../../assets/icon/A10.png");
const iconCar1 = require("../../assets/icon/A8.png");
const iconCar2 = require("../../assets/icon/A9.png");

type CategorySearch = RouteProp<RootStackParamList, 'SearchCategory'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 34) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface CategoryCardProps {
  title: string;
  icon1: any;
  icon2?: any;
  isDisabled?: boolean;
  size: string;
  onPress: () => void;
  index: number;
}

const isTablet = width >= 768;

export default function SearchCategory() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRoute<CategorySearch>();
  const { backPage } = router.params;

  const categories = [
    {
      title: "เพื่อนเที่ยว",
      icon1: iconFriend1,
      icon2: iconFriend2,
      isDisabled: false
    },
    {
      title: "MC/DJ/พิธีกร",
      icon1: iconDJ1,
      icon2: iconDJ2,
      isDisabled: true
    },
    {
      title: "วงดนตรี/นักร้อง",
      icon1: iconMusic1,
      icon2: iconMusic2,
      isDisabled: true
    },
    {
      title: "จองโต๊ะ",
      icon1: iconTable1,
      isDisabled: true
    },
    {
      title: "Concert",
      icon1: iconTicket1,
      isDisabled: true
    },
    {
      title: "FDrive",
      icon1: iconCar1,
      icon2: iconCar2,
      isDisabled: true
    }
  ];

  return (
    <LinearGradient
      colors={['#8B0000', '#4A0404']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <StyledScrollView className="flex-1 pt-20">
        <Animated.View
          className="px-3 pb-20"
        >
          <StyledText className="font-custom text-white text-3xl mb-3 text-center">
            เลือกหมวดหมู่
          </StyledText>

          <StyledView className="flex-row flex-wrap justify-between px-2">
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
              onPress={() => navigation.navigate('Search', {
                searchType: '673080a432edea568b2a6554'
              })}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">

                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className={`absolute ${isTablet ? '-left-14 top-20' : '-left-9 top-10'}`}>
                        <StyledImage
                          source={iconFriend2}
                          className={isTablet ? "w-[286px] h-[286px]" : "w-[143px] h-[143px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className={`absolute ${isTablet ? '-right-14 top-20' : '-right-9 top-10'}`}>
                        <StyledImage
                          source={iconFriend1}
                          className={isTablet ? "w-[286px] h-[286px]" : "w-[143px] h-[143px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-lg'} text-center -mt-5 px-2`}>
                    เพื่อนเที่ยว
                  </StyledText>
                  {/* <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
                  </StyledView> */}
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
              onPress={() => navigation.navigate('Search', {
                searchType: '678bf994b02ec9e77b2b0c1d'
              })}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className={`absolute ${isTablet ? '-left-8 top-20' : '-left-6 top-10'}`}>
                        <StyledImage
                          source={iconDJ2}
                          className={isTablet ? "w-[286px] h-[286px]" : "w-[143px] h-[143px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className={`absolute ${isTablet ? '-right-16 top-20' : '-right-12 top-10'}`}>
                        <StyledImage
                          source={iconDJ1}
                          className={isTablet ? "w-[286px] h-[286px]" : "w-[143px] h-[143px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-lg'} text-center -mt-5 px-2`}>
                    MC/DJ/พิธีกร
                  </StyledText>

                  {/* <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className={`font-custom text-white ${isTablet ? 'text-3xl' : 'text-xl'}`}>SOON</StyledText>
                  </StyledView> */}
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
              onPress={() => navigation.navigate('Search', {
                searchType: '67702f37deb815763b5c8284'
              })}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className={`absolute ${isTablet ? '-left-16 top-20' : '-left-7 top-7'}`}>
                        <StyledImage
                          source={iconMusic1}
                          className={isTablet ? "w-[286px] h-[286px]" : "w-[150px] h-[150px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className={`absolute ${isTablet ? '-right-28 top-20' : '-right-[100px] top-4'}`}>
                        <StyledImage
                          source={iconMusic2}
                          className={isTablet ? "w-[300px] h-[300px]" : "w-[180px] h-[180px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-base'} text-center -mt-5 px-2`}>
                    วงดนตรี/นักร้อง
                  </StyledText>
                  {/* <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className={`font-custom text-white ${isTablet ? 'text-3xl' : 'text-xl'}`}>SOON</StyledText>
                  </StyledView> */}
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className={`w-full h-[120px] items-center justify-center ${isTablet ? 'top-40' : 'top-7'}`}>
                      <StyledImage
                        source={iconTable1}
                        className={isTablet ? "w-[500px] h-[500px]" : "w-[250px] h-[250px]"}
                        resizeMode="contain"
                      />
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-lg'} text-center -mt-5 px-2`}>
                    จองโต๊ะ
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className={`font-custom text-white ${isTablet ? 'text-3xl' : 'text-xl'}`}>SOON</StyledText>
                  </StyledView>
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className={`w-full h-[120px] items-center justify-center ${isTablet ? 'top-48 -left-1' : 'right-1 top-[55px]'}`}>
                      <StyledImage
                        source={iconTicket1}
                        className={isTablet ? "w-[260px] h-[260px]" : "w-[130px] h-[130px]"}
                        resizeMode="contain"
                      />
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-lg'} text-center -mt-5 px-2`}>
                    Concert
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className={`font-custom text-white ${isTablet ? 'text-3xl' : 'text-xl'}`}>SOON</StyledText>
                  </StyledView>
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>

            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className={`absolute ${isTablet ? '-right-44 top-20' : '-right-[90px] top-2'}`}>
                        <StyledImage
                          source={iconCar1}
                          className={isTablet ? "w-[430px] h-[430px]" : "w-[215px] h-[215px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className={`absolute ${isTablet ? '-right-16 top-20' : '-right-7 top-[10px]'}`}>
                        <StyledImage
                          source={iconCar2}
                          className={isTablet ? "w-[180px] h-[180px]" : "w-[90px] h-[90px]"}
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className={`font-custom text-white ${isTablet ? 'text-2xl' : 'text-lg'} text-center -mt-5 px-2`}>
                    FDrive
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className={`font-custom text-white ${isTablet ? 'text-3xl' : 'text-xl'}`}>SOON</StyledText>
                  </StyledView>
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>
          </StyledView>
        </Animated.View>
      </StyledScrollView >

      <AnimatedTouchable
        onPress={() => backPage ? navigation.navigate(backPage == "FastTab" ? "FeedsTab" : backPage as any, {}) : navigation.goBack()}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center absolute top-6 left-6 mt-14"
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </AnimatedTouchable>
    </LinearGradient >
  );
}