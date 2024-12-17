import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Dimensions, Image, StyleSheet, ActivityIndicator, Alert, Pressable, useAnimatedValue } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import MapView, { Marker, Circle } from 'react-native-maps';
import Animated, {
  useSharedValue,
  FadeInUp,
  FadeInDown,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
  withRepeat
} from 'react-native-reanimated';
import { RootStackParamList } from "@/types";
import { Feather } from "lucide-react-native";
const Icon = require('../../assets/icon/search.gif');

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

type CategorySearch = RouteProp<RootStackParamList, 'SearchCategory'>;

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
  const [timeLeft, setTimeLeft] = useState(15);
  const [dots, setDots] = useState('');
  const router = useRoute<CategorySearch>();
  const { backPage } = router.params;

  const backgroundAnim = useSharedValue(0);
  const _color = "#AB1815";
  const _size = 100;

  useEffect(() => {
    // ควรย้าย timer ไปไว้ในเงื่อนไข step === 3 เพื่อป้องกันการทำงานที่ไม่จำเป็น
    if (step === 3) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 60000);

      const dotsTimer = setInterval(() => {
        setDots(prev => prev.length < 3 ? prev + '.' : '');
      }, 500);

      return () => {
        clearInterval(timer);
        clearInterval(dotsTimer);
      };
    }
  }, [step]);

  const styleRipple = StyleSheet.create({
    dot: {
      width: _size,
      height: _size,
      borderRadius: _size / 2,
      backgroundColor: _color,
    },
  })

  const joblist = [
    { label: "นั่งคุย", value: "talk" },
    { label: "ทานข้าว", value: "dinner" },
    { label: "ท่องเที่ยว", value: "travel" },
  ];

  const handleCreateSchedule = async () => {
    // if (!scheduleDate || !scheduleTime || !scheduleJobs || !scheduleLocation || !pin) {
    //   Alert.alert("กรุณากรอกข้อมูลให้ครบ");
    //   return;
    // }

    // setLoading(true);
    // try {
    //   await axios.post("https://friendszone.app/api/schedule", {
    //     date: scheduleDate,
    //     time: scheduleTime,
    //     job: scheduleJobs,
    //     location: scheduleLocation,
    //     pin: pin
    //   });
    //   setStep(3);
    // } catch (error) {
    //   Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    // } finally {
    //   setLoading(false);
    // }
    setLoading(true);
    console.log('create!')
    setStep(3);
    setLoading(false);
  };

  const renderCategorySelection = () => (
    <LinearGradient
      colors={['#8B0000', '#4A0404']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      <StyledScrollView className="flex-1 pt-10">
        <Animated.View
          className="px-3 pb-20"
        >
          <StyledText className="font-custom text-white text-3xl mb-3 text-center">
            เลือกหมวดหมู่ค้นหาด่วน
          </StyledText>

          <StyledView className="flex-row flex-wrap justify-between px-2">
            <AnimatedTouchable
              className="mb-3"
              style={{
                width: CARD_WIDTH - 16,
                height: CARD_HEIGHT,
              }}
              onPress={() => setStep(2)}
            >
              <LinearGradient
                colors={['#FF4B48', '#AB1815']}
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className="absolute -left-9 top-10">
                        <StyledImage
                          source={iconFriend2}
                          className="w-[143px] h-[143px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className="absolute -right-9 top-10">
                        <StyledImage
                          source={iconFriend1}
                          className="w-[143px] h-[143px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-lg text-center -mt-5 px-2">
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
            >
              <LinearGradient
                colors={['#8B0000', '#4A0404']}
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className="absolute -left-6 top-10">
                        <StyledImage
                          source={iconDJ2}
                          className="w-[143px] h-[143px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className="absolute -right-12 top-10">
                        <StyledImage
                          source={iconDJ1}
                          className="w-[143px] h-[143px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-lg text-center -mt-5 px-2">
                    MC/DJ/พิธีกร
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
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
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className="absolute -left-7 top-7">
                        <StyledImage
                          source={iconMusic1}
                          className="w-[150px] h-[150px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className="absolute -right-[100px] top-4">
                        <StyledImage
                          source={iconMusic2}
                          className="w-[180px] h-[180px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-base text-center -mt-5 px-2">
                    วงดนตรี/นักร้อง
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
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
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] items-center justify-center top-7">
                      <StyledImage
                        source={iconTable1}
                        className="w-[250px] h-[250px]"
                        resizeMode="contain"
                      />
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-lg text-center -mt-5 px-2">
                    จองโต๊ะ
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
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
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] items-center justify-center right-1 top-[55px]">
                      <StyledImage
                        source={iconTicket1}
                        className="w-[130px] h-[130px]"
                        resizeMode="contain"
                      />
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-lg text-center -mt-5 px-2">
                    Concert
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
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
                // colors={isDisabled ? ['#8B0000', '#4A0404'] : ['#FF4B48', '#AB1815']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-white/10 border"
              >
                <StyledView className="flex-1 justify-center items-center p-4">
                  <StyledView className="flex-1">
                    <StyledView className="w-full h-[120px] relative">
                      <StyledView className="absolute -right-[90px] top-2">
                        <StyledImage
                          source={iconCar1}
                          className="w-[215px] h-[215px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                      <StyledView className="absolute -right-7 top-[10px]">
                        <StyledImage
                          source={iconCar2}
                          className="w-[90px] h-[90px]"
                          resizeMode="contain"
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>

                  <StyledText className="font-custom text-white text-lg text-center -mt-5 px-2">
                    FDrive
                  </StyledText>
                  <StyledView className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center backdrop-blur-[1px]">
                    <StyledText className="font-custom text-white text-xl">SOON</StyledText>
                  </StyledView>
                </StyledView>
              </LinearGradient>
            </AnimatedTouchable>

          </StyledView>
        </Animated.View>
      </StyledScrollView>
    </LinearGradient>
  );

  const renderAppointmentForm = () => (
    <StyledScrollView className="flex-1 mb-14">
      <AnimatedTouchable
        onPress={() => setStep(1)}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center absolute -top-1 left-6 mt-3"
      >
        <Ionicons name="chevron-back" size={24} color="#EB3834" />
      </AnimatedTouchable>
      <StyledView className="flex-row items-center px-6 py-2 mt-10">
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
          className="rounded-full py-3 shadow-sm mb-14"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <StyledText className="font-custom text-center text-white text-lg font-semibold">
              นัดหมายแบบเร่งด่วน
            </StyledText>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </StyledScrollView>
  );

  const renderWaitingScreen = () => {
    return (
      <LinearGradient
        colors={['#8B0000', '#4A0404']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1 justify-center items-center px-6"
      >
        <Animated.View
          entering={FadeInUp.delay(300).duration(1000)}
          className="items-center"
        >
          <StyledView className="w-[100px] h-[100px] bg-red-400/20 rounded-full items-center justify-center">
            <Image source={Icon} style={{ width: 50, height: 50 }} />
          </StyledView>

          <StyledText className="font-custom text-white text-3xl mb-3 text-center mt-8">
            กำลังรอการตอบรับ
          </StyledText>

          <StyledText className="font-custom text-white/80 text-lg mb-8 text-center">
            โปรดรอสักครู่{'\n'}ระบบกำลังค้นหาเพื่อนที่ว่างให้คุณ
          </StyledText>

          <LinearGradient
            colors={['#FF4B48', '#AB1815']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full h-2 rounded-full mb-4 overflow-hidden"
          >
            <Animated.View
              className="h-full bg-white/90"
              style={{
                width: `${(timeLeft / 15) * 100}%`,
              }}
            />
          </LinearGradient>

          <StyledView className="flex-row items-center">
            <StyledIonIcon name="time-outline" size={24} color="white" style={{ opacity: 0.6 }} />
            <StyledText className="font-custom text-white/60 text-base text-center ml-2">
              เหลือเวลาอีก {timeLeft} นาที
            </StyledText>
          </StyledView>

          <TouchableOpacity
            className="mt-8"
            onPress={() => setStep(1)}
          >
            <LinearGradient
              colors={['#ffffff30', '#ffffff10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-3 rounded-full"
            >
              <StyledText className="font-custom text-white text-base">
                ยกเลิกการค้นหา
              </StyledText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(1000)}
          className="absolute bottom-10 left-6 right-6"
        >
          <StyledText className="font-custom text-white/40 text-sm text-center">
            ระบบจะค้นหาเพื่อนที่ใกล้เคียงและว่างในเวลาที่คุณต้องการ
          </StyledText>
        </Animated.View>
      </LinearGradient>
    );
  };

  return (
    <StyledView className="flex-1">
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
    </StyledView>
  );
}