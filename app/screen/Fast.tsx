import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Dimensions, Image, ActivityIndicator, Alert, SafeAreaView, Appearance } from "react-native";
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';
import Animated, {
  FadeInUp
} from 'react-native-reanimated';
import { RootStackParamList } from "@/types";
import { JobsList } from "@/types/prismaInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderApp } from "@/components/Header";
import { getDatabase, onValue, ref, set } from "firebase/database";
import FireBaseApp from "@/utils/firebaseConfig";
import { getAge } from "@/utils/Date";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
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
type FastData = {
  id: string;
  userId: string;
  timeout: string;
  requestId: string;

}
export default function Fast() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pin, setPin] = useState<{ latitude: number; longitude: number }>({ latitude: 37.78825, longitude: -122.4324 });
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const router = useRoute<CategorySearch>();
  const { backPage } = router.params;
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const isFocus = useIsFocused();


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

  const [userData, setUserData] = useState<any>({});
  const [fastRequest, setFastRequest] = useState<FastData>();
  const [fastList, setFastList] = useState<string[]>([]);
  const [memberAccept, setMemberAccept] = useState<any[]>([]);

  const fetchUserData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    setUserData(JSON.parse(userData || '{}'));
  }

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    fetchUserData();
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (step == 2) {
      getCurrentLocation();
    }
  }, [step]);


  useEffect(() => {
    if (userData?.id) {
      fetchFastRequest();
    }
  }, [userData])




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
            onPress={() => backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack()}
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
                        setScheduleJobs(jobs.jobName);
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
                      <StyledText className={`font-custom ${scheduleJobs ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleJobs ? scheduleJobs : "เลือกประเภทงาน"}</StyledText>
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
                {
                  (!pin.latitude && !pin.longitude) ? (
                    <>
                      <StyledText className="text-lg text-black font-custom dark:text-neutral-200">กำลังโหลดแผนที่</StyledText>
                    </>
                  ) : (
                    <MapView
                      initialRegion={{
                        latitude: pin.latitude,
                        longitude: pin.longitude,
                        latitudeDelta: 15.5136445,
                        longitudeDelta: 100.6519383,
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
                  )
                }
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
    </SafeAreaView >
  );

  const loadProfile = async (profileId: string) => {
    try {
      const res = await axios.get(`https://friendszone.app/api/profile/${profileId}`, {
        headers: {
          Authorization: `All ${userData?.token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.data.status == 200) {
        return res.data.data.profile
      } else {
        return null
      }
    } catch (error) {
      console.log(error);
    }
  }


  
  const database = getDatabase(FireBaseApp);
  const fastUpdate = ref(database, `fast-request/test-fast-request-1/acceptList`);

  useEffect(() => {

    const unsubscribe = onValue(fastUpdate, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setFastList(val.split(',').filter((item: string) => item !== ''));
      } else {
        setFastList([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      const members = await Promise.all(fastList.map(async (member) => {
        const data = await loadProfile(member);
        return data;
      }));
      setMemberAccept(members);
    };

    fetchMembers();
  }, [fastList]);

  const RenderAcceptList = () => {
    return (
      <StyledView className="w-screen px-2 py-2 space-y-2">
        {
          memberAccept.map((member, index) => {
            return (
              <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 100).springify()}
            className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-700"
          >
            <StyledTouchableOpacity
              className="p-4"
              onPress={() => navigation.navigate('Profile', { userId: member.id })}
            >
              <StyledView className="flex-row items-center justify-between">
                <StyledView className="flex-row items-center space-x-4">
                  <StyledView className="relative">
                    <StyledImage
                      source={{ uri: member?.profileUrl }}
                      className="w-16 h-16 rounded-2xl border-2 border-red-500/50"
                    />
                    <StyledView className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                  </StyledView>
                  <StyledView>
                    <StyledText className="font-custom text-xl text-neutral-800 dark:text-white">
                      {member?.username}
                    </StyledText>
                    <StyledView className="flex-row items-center space-x-2 mt-1">
                    <StyledIonIcon
                                                    name="calendar-outline"
                                                    size={20}
                                                    className="text-gray-500 dark:text-gray-400 mr-2"
                                                />
                      <StyledText className="font-custom text-sm text-neutral-500">
                        {getAge(member?.birthday)} ปี
                      </StyledText>
                      <StyledView className="w-1 h-1 rounded-full bg-neutral-300" />
                      <StyledIonIcon
                                                    name={
                                                        member?.gender === "ชาย" ? "male" :
                                                            member?.gender === "หญิง" ? "female" :
                                                                "transgender"
                                                    }
                                                    size={20}
                                                    className={
                                                        member?.gender === "ชาย" ? "text-blue-500" :
                                                            member?.gender === "หญิง" ? "text-pink-500" :
                                                                "text-purple-500"
                                                    }
                                                />
                      <StyledText className="font-custom text-sm text-neutral-500">
                        {member?.gender}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>

                <StyledView className="items-end">
                  <StyledText className="font-custom text-xl font-semibold text-red-500">
                    ฿{member?.amount?.toLocaleString() || '00.00'}
                  </StyledText>
                  <StyledView className="flex-row items-center mt-1">

                    <StyledIonIcon name="star" size={24} color="#FCD34D" />
                    <StyledText className="font-custom text-lg text-neutral-400 ml-1">
                      {
                        member?.rating
                      }
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>

              <StyledView className="flex-row justify-end space-x-3 mt-4">
                <StyledTouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "ยืนยันการลบสมาชิก",
                      `คุณต้องการลบ ${member?.username} ออกจากรายการหรือไม่`,
                      [
                        {
                          text: "ลบ",
                          onPress: () => {
                            const newFastList = fastList.filter((item) => item !== member.id);
                            setFastList(newFastList);
                            setMemberAccept(memberAccept.filter((item) => item.id !== member.id));
                            set(ref(database, `fast-request/test-fast-request-1/acceptList`), newFastList.join(','));
                          },
                          style: "cancel"
                        },
                        { text: "ยกเลิก" }
                      ]
                    )
                  }}
                  className=" px-5 py-2.5 rounded-2xl flex-row items-center"
                >
                  <StyledIonIcon name="close-outline" size={18} className="text-red-600" />
                  <StyledText className="font-custom text-red-600 dark:text-red-300 ml-1">
                    ลบ
                  </StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                  className="bg-neutral-100 dark:bg-neutral-700/50 px-5 py-2.5 rounded-2xl flex-row items-center"
                >
                  <StyledIonIcon name="checkmark-outline" size={18} className="text-black dark:text-white" />
                  <StyledText className="font-custom text-black dark:text-white ml-1">
                    เลือกและชำค่าบริการ
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledTouchableOpacity>
          </Animated.View>
            )
          })
        }
      </StyledView>
    )
  }


  const renderWaitingScreen = () => {




    return (
      <StyledView
        className="flex-1 justify-center items-center"
      >
        <HeaderApp />
        <SafeAreaView className="flex-1">
          <RenderAcceptList />

          <StyledView className="items-center px-6 py-8">
            <StyledText className="font-custom text-neutral-600 dark:text-neutral-400 text-base text-center">
              {/* timeout = 2020-12-28T00:00:00.000Z  i want to 28/12/2024 00:00:00*/}
              กำลังค้นหาเพื่อนที่ว่างให้คุณ{'\n'}หมดเวลาตอน {
                new Date(fastRequest?.timeout as string).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              }
            </StyledText>

            <StyledTouchableOpacity
              className="bg-red-500 rounded-full px-6 py-3 mt-4"
              onPress={() => {
                Alert.alert(
                  "ยกเลิกการค้นหา",
                  "คุณต้องการยกเลิกการค้นหาหรือไม่",
                  [
                    {
                      text: "ยกเลิก",
                      onPress: () => cancelFastRequest(),
                      style: "cancel"
                    },
                    { text: "กลับ" }
                  ]
                );
              }}
            >
              <StyledText className="font-custom text-white">
                ยกเลิกการค้นหา
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </SafeAreaView>
      </StyledView>
    );
  };


  const cancelFastRequest = async () => {
    try {
      const res = await axios.put(`http://49.231.43.37:3000/api/fast/${userData?.id}`, {
        id: userData?.id
      }, {
        headers: {
          Authorization: `All ${userData?.token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {

    }
  }

  const fetchFastRequest = async () => {
    try {
      const res = await axios.get(`http://49.231.43.37:3000/api/fast/${userData?.id}`, {
        headers: {
          Authorization: `All ${userData?.token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.data) {
        if (res.data.data) {
          setFastRequest(res.data.data);
          setStep(3);
          if (res.data.data.timeout) {
            const time = res.data.data.timeout;
            const timeLeft = Math.floor((new Date(time).getTime() - new Date().getTime()) / 1000 / 60);
            setTimeLeft(timeLeft);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <StyledView className="flex-1">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StyledView className="flex-1 bg-white dark:bg-neutral-900">
          {step === 1 && renderCategorySelection()}
          {step === 2 && renderAppointmentForm()}
          {step === 3 && renderWaitingScreen()}
        </StyledView>
      </KeyboardAvoidingView>
    </StyledView>
  );
}