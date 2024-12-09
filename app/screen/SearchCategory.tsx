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
const iconMusic1 = require("../../assets/icon/A7.png");
const iconMusic2 = require("../../assets/icon/A6.png");
const iconTable1 = require("../../assets/icon/A4.png");
const iconTicket1 = require("../../assets/icon/A10.png");
const iconCar1 = require("../../assets/icon/A8.png");
const iconCar2 = require("../../assets/icon/A9.png");

type CategorySearch = RouteProp<RootStackParamList, 'SearchCategory'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2; // ปรับขนาดการ์ดให้พอดีกับ 2 แถว
const CARD_HEIGHT = CARD_WIDTH * 1.4; // ปรับความสูงให้รับกับการวางไอคอนใหม่

interface CategoryCardProps {
  title: string;
  icon1: any;
  icon2?: any;
  isDisabled?: boolean;
  onPress: () => void;
  index: number;
}

const CategoryCard = ({ title, icon1, icon2, isDisabled = false, onPress, index }: CategoryCardProps) => {
  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(index * 100).springify()}
      onPress={onPress}
      disabled={isDisabled}
      className="mb-4"
      style={{
        width: CARD_WIDTH - 16,
        height: CARD_HEIGHT,
      }}
    >
      <LinearGradient
        colors={isDisabled ? ['#666', '#333'] : ['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full h-full rounded-3xl overflow-hidden shadow-lg"
      >
        <StyledView className="flex-1 justify-center items-center p-4">
          <StyledView className="w-full h-[65%] relative justify-center items-center">
            {icon2 ? (
              // ถ้ามีไอคอน 2 อัน จะวางแบบซ้อนทแยง
              <>
                <Animated.View 
                  entering={FadeInDown.delay(index * 150)}
                  className="absolute"
                  style={{
                    transform: [
                      { translateX: -25 },
                      { translateY: -5 },
                      { scale: 0.85 },
                      { rotate: '-10deg' }
                    ]
                  }}
                >
                  <StyledImage 
                    source={icon1}
                    className="w-[90px] h-[90px]"
                  />
                </Animated.View>
                <Animated.View 
                  entering={FadeInDown.delay(index * 200)}
                  className="absolute"
                  style={{
                    transform: [
                      { translateX: 25 },
                      { translateY: 5 },
                      { scale: 0.85 },
                      { rotate: '15deg' }
                    ]
                  }}
                >
                  <StyledImage 
                    source={icon2} 
                    className="w-[100px] h-[100px]"
                  />
                </Animated.View>
              </>
            ) : (
              // ถ้ามีไอคอนเดียว จะวางตรงกลาง
              <Animated.View 
                entering={FadeInDown.delay(index * 150)}
                style={{ transform: [{ scale: 1 }] }}
              >
                <StyledImage 
                  source={icon1} 
                  className="w-[120px] h-[120px]"
                />
              </Animated.View>
            )}
          </StyledView>
          
          <StyledText className="font-custom text-white text-lg text-center mt-2 px-2">
            {title}
          </StyledText>
          
          {isDisabled && (
            <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
              <StyledText className="font-custom text-white text-xl">SOON</StyledText>
            </StyledView>
          )}
        </StyledView>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

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
      colors={['#1A1A1A', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <StyledScrollView className="flex-1 pt-20">
        <Animated.View 
          entering={FadeInDown.springify()}
          className="px-3 pb-6"
        >
          <StyledText className="font-custom text-white text-3xl mb-8 text-center">
            เลือกหมวดหมู่
          </StyledText>
          
          <StyledView className="flex-row flex-wrap justify-between px-2">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                icon1={category.icon1}
                icon2={category.icon2}
                isDisabled={category.isDisabled}
                onPress={() => navigation.navigate('Search', { searchType: "Friend" })}
                index={index}
              />
            ))}
          </StyledView>
        </Animated.View>
      </StyledScrollView>

      <AnimatedTouchable
        entering={FadeInDown.delay(400).springify()}
        onPress={() => backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack()}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center absolute top-6 left-6 mt-14"
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </AnimatedTouchable>
    </LinearGradient>
  );
}