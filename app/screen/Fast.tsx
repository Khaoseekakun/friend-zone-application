import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Dimensions, Image, StyleSheet, ActivityIndicator, Alert, Pressable, useAnimatedValue, SafeAreaView, useColorScheme, Appearance } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { HeaderApp } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import Animated, {
  useSharedValue,
  FadeInUp,
  FadeInDown,
  withTiming,
  Easing,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  interpolate
} from 'react-native-reanimated';
import { RootStackParamList } from "@/types";
import { Feather } from "lucide-react-native";
import { JobsList } from "@/types/prismaInterface";
const Icon = require('../../assets/icon/search.gif');

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledMapView = styled(MapView)
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
  const [pin, setPin] = useState<{ latitude: number; longitude: number }>({ latitude: 37.78825, longitude: -122.4324 });
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [dots, setDots] = useState('');
  const router = useRoute<CategorySearch>();
  const { backPage } = router.params;
  const [theme, setTheme] = useState(Appearance.getColorScheme());



  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleJobs, setScheduleJobs] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [categoryId, setCategoryId] = useState('');
  const [jobsList, setJobsList] = useState<JobsList[]>([]);
  const [scheduleNote, setScheduleNote] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [showSelectJobs, setShowSelectJob] = useState(false);

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => listener.remove();
  }, []);

  const backgroundAnim = useSharedValue(0);
  const _color = "#AB1815";
  const _size = 100;

  useEffect(() => {
    if (step === 3) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 60000);

      const dotsTimer = setInterval(() => {
        setDots(prev => prev?.length < 3 ? prev + '.' : '');
      }, 500);

      return () => {
        clearInterval(timer);
        clearInterval(dotsTimer);
      };
    }

    if (step == 2) {
      getCurrentLocation();
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
    setLoading(true);
    console.log('create!')
    setStep(3);
    setLoading(false);
  };

  const loadJobsList = async (categoryId: string) => {
    try {
      const res = await axios.get(`https://friendszone.app/api/categoryJobs/${categoryId}/jobslist`);
      setJobsList(res.data.body);
      setStep(2);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    }
  }

  const renderCategorySelection = () => (
    <LinearGradient
      colors={['#8B0000', '#4A0404']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1 pt-10"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StyledScrollView className="flex-1">
          <AnimatedTouchable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center absolute left-6 mt-3 z-10 "
          >
            <Ionicons name="chevron-back" size={24} color="#EB3834" />
          </AnimatedTouchable>
          <Animated.View
            className="px-3 pb-20"
          >
            <StyledText className="font-custom text-white text-3xl mb-3 text-center mt-4 ml-10">
              เลือกหมวดหมู่ค้นหาด่วน
            </StyledText>

            <StyledView className="flex-row flex-wrap justify-between px-2">
              <AnimatedTouchable
                className="mb-3"
                style={{
                  width: CARD_WIDTH - 16,
                  height: CARD_HEIGHT,
                }}
                onPress={() => {
                  setCategoryId('673080a432edea568b2a6554')
                  loadJobsList('673080a432edea568b2a6554')
                }}
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
                      เพื่อเที่ยว
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
      </SafeAreaView>
    </LinearGradient>
  );

  const getCurrentLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setPin({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

  }

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    setScheduleDate(formattedDate);
    setScheduleTime("");
    hideDatePicker();
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (date: Date) => {
    const timeFormat = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setScheduleTime(timeFormat);
    hideTimePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const showSelectJob = () => {
    setShowSelectJob(true);
  }

  const hideSelectJob = () => {
    setShowSelectJob(false);
  }

  const renderAppointmentForm = () => (
    <SafeAreaView style={{ flex: 1, height: '100%' }}>
      <StyledView className="flex-1">
        {
          showSelectJobs ? (
            <>
              <LinearGradient
                colors={['rgba(236,72,153,0.03)', 'rgba(249,115,22,0.03)']}
                className="flex-1 px-4 pt-4 font-custom"
              >
                <TouchableOpacity
                  onPress={hideSelectJob}
                  className="flex-row items-center mb-8"
                >
                  <StyledView className="bg-white dark:bg-gray-800 p-2 rounded-full">
                    <StyledIonIcon
                      name="chevron-back"
                      size={24}
                      className="text-[#8B0000] font-custom dark:text-orange-500"
                    />
                  </StyledView>
                  <StyledText className="ml-3 text-xl font-custom font-semibold text-gray-800 dark:text-white">
                    เลือกประเภทงาน
                  </StyledText>
                </TouchableOpacity>

                <StyledView className="space-y-3">
                  {jobsList?.map((jobs, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setScheduleJobs(jobs.id);
                        hideSelectJob();
                      }}
                    >
                      <StyledView className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm active:scale-95 transform transition-all flex-row items-center justify-between">
                          <StyledText className="text-base font-custom font-semibold text-gray-800 dark:text-white">
                            {jobs.jobName}
                          </StyledText>
                          <StyledIonIcon
                            name="chevron-forward"
                            size={20}
                            className="text-[#8B0000]/50 dark:text-orange-500/50"
                          />
                      </StyledView>
                    </TouchableOpacity>
                  ))}
                </StyledView>
              </LinearGradient>
            </>
          ) : (
            <>
              <AnimatedTouchable
                onPress={() => setStep(1)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center left-3 mt-10 "
              >
                <Ionicons name="chevron-back" size={24} color="#EB3834" />
              </AnimatedTouchable>
              <StyledView className="flex-row items-center px-6 py-1">
                <StyledView className="w-6/12 px-1">
                  <StyledText className="text-lg text-black font-custom dark:text-neutral-200">วัน/เดือน/ปี</StyledText>

                  <TouchableOpacity
                    onPress={showDatePicker}>
                    <StyledView
                      className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full dark:text-neutral-200"
                    >
                      <StyledText className={`font-custom ${scheduleDate ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleDate ? scheduleDate : "03/10/2567"}</StyledText>
                    </StyledView>
                  </TouchableOpacity>
                </StyledView>

                <StyledView className="w-6/12 px-1">
                  <StyledText className="text-lg text-black font-custom dark:text-neutral-200">เวลา</StyledText>

                  <TouchableOpacity
                    onPress={showTimePicker}>
                    <StyledView
                      className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full dark:text-neutral-200"
                    >
                      <StyledText className={`font-custom ${scheduleTime ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleTime ? scheduleTime : "10:10"}</StyledText>
                    </StyledView>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>
              <StyledView className="flex-row items-center px-6 py-1">
                <StyledView className="w-full px-1">
                  <StyledText className="text-lg text-black font-custom dark:text-neutral-200">
                    ประเภทงาน
                  </StyledText>
                  <TouchableOpacity
                    onPress={showSelectJob}>
                    <StyledView
                      className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full dark:text-neutral-200"
                    >
                      <StyledText className={`font-custom ${scheduleJobs ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleJobs ? jobsList.find((j) => j.id == scheduleJobs)?.jobName : "เลือกประเภทงาน"}</StyledText>
                    </StyledView>
                  </TouchableOpacity>
                </StyledView>
              </StyledView>

              <StyledView className="flex-row items-center px-6 py-1">
                <StyledView className="w-full px-1">
                  <StyledText className="text-lg text-black font-custom dark:text-neutral-200">
                    หมายเหตุ
                  </StyledText>

                  <StyledView
                    className="font-custom border border-gray-300 rounded-2xl py-2 px-4 text-gray-700 w-full dark:text-neutral-200"
                  >
                    <TextInput
                      placeholder="กรอกหมายเหตุ (ถ้ามี)"
                      value={scheduleNote}
                      onChangeText={setScheduleNote}
                      multiline={true}
                      numberOfLines={3}
                      className="font-custom text-gray-700 dark:text-white"
                      placeholderTextColor="#d1d5db"
                      style={{
                        textAlignVertical: 'top',
                        minHeight: 40,
                      }}
                    />
                  </StyledView>
                </StyledView>
              </StyledView>

              <StyledView className="items-center px-6 py-1">
                <StyledView className="w-full px-1">
                  <StyledText className="text-lg text-black font-custom dark:text-neutral-200">จุดนัดหมาย</StyledText>
                  <StyledView
                    className="font-custom border border-gray-300 rounded-2xl py-2 px-4 text-gray-700 w-full dark:text-neutral-200"
                  >
                    <TextInput
                      placeholder="จุดนัดหมาย"
                      value={scheduleLocation}
                      onChangeText={setScheduleLocation}
                      className="font-custom text-gray-700 dark:text-white"
                      placeholderTextColor="#d1d5db"
                      style={{
                        textAlignVertical: 'top',
                        minHeight: 40,
                      }}
                    />
                  </StyledView>


                </StyledView>
              </StyledView>

              <StyledView className="px-6 py-1 rounded-2xl my-2 mt-5 h-[50%]">
                <MapView
                  initialRegion={{
                    latitude: pin ? pin.latitude : 37.78825,
                    longitude: pin ? pin.longitude : -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                  onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setPin({ latitude, longitude });
                  }}
                  style={{
                    borderRadius: 20,
                    height: "70%",
                  }}
                >
                  {pin && (
                    <>
                      <Marker
                        coordinate={{
                          latitude: pin.latitude,
                          longitude: pin.longitude,
                        }}
                        title="Selected Location"
                        draggable={true}
                      />
                      <Circle
                        center={pin}
                        radius={250} // radius in meters
                        strokeColor="rgba(255, 0, 0, 0.5)" // Border color
                        fillColor="rgba(255, 0, 0, 0.2)" // Fill color
                      />
                    </>
                  )}
                </MapView>
              </StyledView>
            </>
          )
        }
      </StyledView>
      {
        !showSelectJobs && (
          <TouchableOpacity
            className="w-full px-6 absolute bottom-4"
            onPress={handleCreateSchedule}
            disabled={loading}
          >
            <LinearGradient
              colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full py-3 shadow-sm"
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
        )
      }

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        locale="th-TH"
        minimumDate={new Date(Date.now())}
        shouldRasterizeIOS
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        locale="th-TH"
        shouldRasterizeIOS
        minimumDate={
          scheduleDate
            ?
            new Date(Date.now()).getDate() == new Date(`${scheduleDate.split("/")[2]}-${scheduleDate.split("/")[1]}-${scheduleDate.split("/")[0]}`).getDate()
              ? new Date(Date.now() + 60 * 60 * 1000)
              : undefined
            : new Date(Date.now() + 60 * 60 * 1000)
        }
      />
    </SafeAreaView>
  );

  useEffect(() => {
    if (step === 3) {
      backgroundAnim.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [step]);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(backgroundAnim.value, [0, 1], [1, 2]) }],
      opacity: interpolate(backgroundAnim.value, [0, 1], [0.7, 0]),
    };
  });

  const renderWaitingScreen = () => {
    return (
      <LinearGradient
        colors={['#8B0000', '#4A0404']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1 justify-center items-center px-6"
      >
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View
            entering={FadeInUp.delay(300).duration(1000)}
            className="items-center"
          >
            <StyledView className="relative">
              <Animated.View
                style={[styleRipple.dot, rStyle, { position: 'absolute' }]}
              />
              <Animated.View
                style={[
                  styleRipple.dot,
                  rStyle,
                  { position: 'absolute', transform: [{ scale: 1.5 }] },
                ]}
              />
              <Animated.View
                className="w-[120px] h-[120px] bg-red-400/20 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#FF4B48",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 10
                }}
              >
                <Image
                  source={Icon}
                  style={{ width: 60, height: 60 }}
                  className="opacity-90"
                />
              </Animated.View>
            </StyledView>

            <StyledText className="font-custom text-white text-4xl mb-2 text-center mt-10 p-1">
              กำลังค้นหา{dots}
            </StyledText>

            <StyledText className="font-custom text-white/70 text-lg mb-12 text-center">
              ระบบกำลังค้นหาเพื่อนที่ว่างให้คุณ{'\n'}โปรดรอสักครู่
            </StyledText>

            <LinearGradient
              colors={['#FF4B48', '#AB1815']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-full h-3 rounded-full mb-4 overflow-hidden"
              style={{
                shadowColor: "#FF4B48",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
            >
              <Animated.View
                className="h-full bg-white/90"
                style={{
                  width: `${(timeLeft / 15) * 100}%`,
                }}
              />
            </LinearGradient>

            <StyledView className="flex-row items-center bg-white/10 px-6 py-3 rounded-full">
              <StyledIonIcon name="time-outline" size={24} color="white" style={{ opacity: 0.8 }} />
              <StyledText className="font-custom text-white/80 text-lg text-center ml-2">
                เหลือเวลาอีก {timeLeft} นาที
              </StyledText>
            </StyledView>

            <TouchableOpacity
              className="mt-12"
              onPress={() => setStep(1)}
            >
              <LinearGradient
                colors={['#ffffff40', '#ffffff15']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-10 py-4 rounded-full"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 5
                }}
              >
                <StyledText className="font-custom text-white text-lg">
                  ยกเลิกการค้นหา
                </StyledText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <StyledText className="font-custom text-white/40 text-base text-center mt-12 px-6">
            ระบบจะค้นหาเพื่อนที่ใกล้เคียงและว่างในเวลาที่คุณต้องการ
          </StyledText>
        </SafeAreaView>
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