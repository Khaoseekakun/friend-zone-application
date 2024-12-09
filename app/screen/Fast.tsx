import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Dimensions, Image, ActivityIndicator, Alert } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import MapView, { Marker, Circle } from 'react-native-maps';
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledMapView = styled(MapView);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Import icons
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
                    style={{ opacity: 0.95 }}
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
                      { rotate: '10deg' }
                    ]
                  }}
                >
                  <StyledImage 
                    source={icon2} 
                    className="w-[90px] h-[90px]"
                    style={{ opacity: 0.95 }}
                  />
                </Animated.View>
              </>
            ) : (
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

export default function Fast() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [search, setSearch] = useState('');
  const [searchloading, setSearchLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleJobs, setScheduleJobs] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

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

  const joblist = [
    { label: "นั่งคุย", value: "talk" },
    { label: "ทานข้าว", value: "dinner" },
    { label: "ท่องเที่ยว", value: "travel" },
  ];

  const handleCreateSchedule = async () => {
    if (!scheduleDate || !scheduleTime || !scheduleJobs || !scheduleLocation || !pin) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://friendszone.app/api/schedule", {
        date: scheduleDate,
        time: scheduleTime,
        job: scheduleJobs,
        location: scheduleLocation,
        pin: pin
      });
      setStep(3);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelection = () => (
    <StyledView className="flex-1">
      <StyledScrollView className="flex-1 pt-4">
        <Animated.View 
          entering={FadeInDown.springify()}
          className="px-3 pb-6"
        >
          <StyledText className="font-custom text-2xl mb-8 text-center dark:text-white">
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
                onPress={() => setStep(2)}
                index={index}
              />
            ))}
          </StyledView>
        </Animated.View>
      </StyledScrollView>
    </StyledView>
  );

  const renderAppointmentForm = () => (
    <StyledScrollView className="flex-1">
      <StyledView className="flex-row items-center px-6 py-2">
        <StyledView className="w-6/12 px-1">
          <StyledText className="text-lg font-custom dark:text-neutral-200">วัน/เดือน/ปี</StyledText>
          <TouchableOpacity>
            <StyledView className="border border-gray-300 rounded-2xl py-4 px-4">
              <StyledText className="font-custom text-gray-700 dark:text-white">
                {scheduleDate || "03/10/2567"}
              </StyledText>
            </StyledView>
          </TouchableOpacity>
        </StyledView>

        <StyledView className="w-6/12 px-1">
          <StyledText className="text-lg font-custom dark:text-neutral-200">เวลา</StyledText>
          <TouchableOpacity>
            <StyledView className="border border-gray-300 rounded-2xl py-4 px-4">
              <StyledText className="font-custom text-gray-700 dark:text-white">
                {scheduleTime || "10:10"}
              </StyledText>
            </StyledView>
          </TouchableOpacity>
        </StyledView>
      </StyledView>

      {/* Job Type Selection */}
      <StyledView className="flex-row items-center px-6 py-2">
        <StyledView className="w-full px-1">
          <StyledText className="text-lg font-custom dark:text-neutral-200">
            ประเภทงาน
          </StyledText>
          <TouchableOpacity>
            <StyledView className="border border-gray-300 rounded-2xl py-4 px-4">
              <StyledText className="font-custom text-gray-700 dark:text-white">
                {scheduleJobs ? joblist.find(j => j.value === scheduleJobs)?.label : "เลือกประเภทงาน"}
              </StyledText>
            </StyledView>
          </TouchableOpacity>
        </StyledView>
      </StyledView>

      {/* Location */}
      <StyledView className="items-center px-6 py-2">
        <StyledView className="w-full px-1">
          <StyledText className="text-lg font-custom dark:text-neutral-200">จุดนัดหมาย</StyledText>
          <TouchableOpacity onPress={() => setSearchFocus(true)}>
            <StyledView className="border border-gray-300 rounded-2xl py-4 px-4">
              <StyledText className="font-custom text-gray-700 dark:text-white">
                {scheduleLocation || "ค้นหาสถานที่"}
              </StyledText>
            </StyledView>
          </TouchableOpacity>
        </StyledView>
      </StyledView>

      {/* Map */}
      <StyledView className="px-6 py-2 rounded-2xl my-2 mt-5 h-[300px]">
        <StyledMapView
          initialRegion={{
            latitude: 13.7563,
            longitude: 100.5018,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          className="w-full h-full rounded-2xl"
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPin({ latitude, longitude });
          }}
        >
          {pin && (
            <>
              <Marker coordinate={pin} />
              <Circle
                center={pin}
                radius={250}
                strokeColor="rgba(255, 0, 0, 0.5)"
                fillColor="rgba(255, 0, 0, 0.2)"
              />
            </>
          )}
        </StyledMapView>
      </StyledView>

      {/* Submit Button */}
      <TouchableOpacity
        className="w-full px-6 my-6"
        onPress={handleCreateSchedule}
        disabled={loading}
      >
        <LinearGradient
          colors={['#EB3834', '#69140F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-full py-3 shadow-sm"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <StyledText className="font-custom text-center text-white text-lg font-semibold">
              ส่งคำขอนัดหมาย
            </StyledText>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </StyledScrollView>
  );

  const renderWaitingScreen = () => (
    <StyledView className="flex-1 justify-center items-center">
      <StyledText className="text-2xl font-semibold mb-4 dark:text-white">
        กำลังรอการตอบรับ
      </StyledText>
      <ActivityIndicator size="large" color="#EB3834" />
    </StyledView>
  );

  return (
    <StyledView className="flex-1">
      <HeaderApp />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StyledView className="flex-1 bg-white dark:bg-black">
        {step === 1 && renderCategorySelection()}
          {step === 2 && renderAppointmentForm()}
          {step === 3 && renderWaitingScreen()}
        </StyledView>
      </KeyboardAvoidingView>
      <Navigation current="FastTab"/>
    </StyledView>
  );
}