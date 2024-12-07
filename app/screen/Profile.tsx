import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, ScrollView, Dimensions, Image, Linking, Appearance, Platform } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { NavigationProp, RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import axios from "axios";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSharedValue, configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { getAge } from "@/utils/Date";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Location from 'expo-location';
import MapView, { Circle, Marker, LatLng } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Carousel from 'react-native-reanimated-carousel';
import RNPickerSelect from 'react-native-picker-select';
import { sendPushNotification } from "@/utils/Notification";
import DateTimePicker from 'react-native-ui-datepicker';

configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
});

const StyledMapView = styled(MapView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledIonIcon = styled(Ionicons);
const StyledTextInput = styled(TextInput);
const StyledGooglePlacesAutocomplete = styled(GooglePlacesAutocomplete);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledDatePicker = styled(DateTimePicker);
type ProfileParam = RouteProp<RootStackParamList, 'ProfileTab'>;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function ProfileTab() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<ProfileParam>();
    const { profileId, jobCategory, backPage, searchType } = route.params;
    const isFoucs = useIsFocused()
    const convertJobs = {
        "Friend": "เพื่อนท่องเที่ยว"
    }


    const translateX = useSharedValue(0);
    const currentIndex = useSharedValue(0);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["85%"], []);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userData, setUserData] = useState<any>({});
    const [isActive, setIsActive] = useState(0);
    const [scheduleTime, setScheduleTime] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleJobs, setScheduleJobs] = useState<string>();
    const [scheduleLocation, setScheduleLocation] = useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [distance, setDistance] = useState<number>(0);
    const [joblist, setJobList] = useState<{
        label: string;
        value: string;
    }[]>([]);
    const [geoLocation, setGeoLocation] = useState<{
        latitude: number,
        longitude: number,
        locationName: string
    }[]>([])

    const [showSelectJobs, setShowSelectJob] = useState(false);

    const [searchFocus, setSearchFocus] = useState<boolean>(false);

    const [locationSearch, setLocationSearch] = useState<string>("");


    const [pin, setPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [selfPin, setSelfPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);


    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const openAppSettings = () => {
        Linking.openSettings().catch(() => {
            Alert.alert('ไม่สามารถไปหน้าตั้งค่าได้', 'โปรดเปิดการอนุญาตการเข้าถึงตำแหน่ง ด้วยตัวคุณเอง');
        });
    };

    const [images, setImages] = useState<string[]>([]);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setHasLocationPermission(true);
            const location = await Location.getCurrentPositionAsync({});
            setSelfPin({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });


            setDistance(getDistanceMemberToCustomer({ latitude: location.coords.latitude, longitude: location.coords.longitude }, {
                latitude: parseFloat(userProfile?.profile.pinLocation[0]),
                longitude: parseFloat(userProfile?.profile.pinLocation[1])
            }));
        }
    };

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


    const searchMapGeoLocation = async (location: string) => {
        const config = {
            method: 'get',
            url: `https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=11f05231e68b44deac129650b5bf211d`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await axios(config);
            const newLocations = response.data.features.map((feature: any) => ({
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
                locationName: feature.properties.formatted || location
            }));

            setGeoLocation(newLocations);

        } catch (error) {
            console.error("Failed to fetch map geo location:", error);
        }
    }

    const loadJobsList = async () => {
        try {
            if (!jobCategory) {
                if (userProfile.profile.JobMembers.length > 0) {
                    const resdata = await axios.get(`https://friendszone.app/api/jobs?jobId=${userProfile?.profile?.JobMembers[0].jobId}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `All ${userData.token}`
                        }
                    })

                    if (resdata.data.status == 200) {
                        setJobList(resdata.data.data.map((job: any) => ({
                            label: job.jobName,
                            value: job.id,

                        })))
                    } else {
                        console.log(resdata.data)
                    }
                }
            } else {
                const resdata = await axios.get(`https://friendszone.app/api/jobs?categoryType=${convertJobs[jobCategory as keyof typeof convertJobs]}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `All ${userData.token}`
                    }
                })

                if (resdata.data.status == 200) {
                    setJobList(resdata.data.data.map((job: any) => ({
                        label: job.jobName,
                        value: job.id,

                    })))

                    console.log(resdata.data.data)
                } else {
                    console.log(resdata.data)
                }
            }


        } catch (error) {
            console.error("Failed to fetch jobs list:", error);
        }
    }

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedData = storedUserData ? JSON.parse(storedUserData) : null;
            setUserData(parsedData);

            if (!profileId) {
                Alert.alert("Error", "User profile not found", [
                    {
                        text: "Go to Home",
                        onPress: () => navigation.navigate("HomeScreen", {})
                    }
                ]);
                return;
            }

            const user = await axios.get(`https://friendszone.app/api/profile/${profileId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${parsedData?.token}`
                }
            });


            setUserProfile(user.data.data);
            setImages(user.data.data?.profile.previewAllImageUrl)
            setIsActive(0);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, [profileId, navigation]);

    useEffect(() => {
        if (loading === false) {
            if (userProfile?.profile.type === "member" && loading === false) {
                loadJobsList();
            }
        } else {
            fetchUserData();
            requestLocationPermission();
        }
    }, [isFoucs, loading, userProfile]);

    const [theme, setTheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, [])

    /**
    * @param {LatLng} point1 
    * @param {LatLng} point2 
    * @returns {number}
    */
    const getDistance = (point1: LatLng, point2: LatLng): number => {
        const R = 6371000;
        const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
        const dLon = (point2.longitude - point1.longitude) * (Math.PI / 180);
        const lat1 = point1.latitude * (Math.PI / 180);
        const lat2 = point2.latitude * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };


    const getDistanceMemberToCustomer = (selfPin: LatLng, memberPin: LatLng): number => {
        return getDistance(selfPin, memberPin);
    }

    const getDistanceMemberToPinLocation = (locationPin: LatLng, memberPin: LatLng): number => {
        return getDistance(locationPin, memberPin);
    }


    const createSchedule = async () => {
        if (!scheduleDate || !scheduleTime) {
            return Alert.alert('ข้อมูลไม่ครบ', 'โปรดกรอกข้อมูลให้ครบถ้วน', [{ text: 'OK' }]);
        }

        const [day, month, year] = scheduleDate.split("/").map(Number);
        const [hour, minute] = scheduleTime.split(":").map(Number);


        const scheduleDateTime = new Date(year, month - 1, day, hour, minute);
        if (isNaN(scheduleDateTime.getTime())) {
            return Alert.alert('ผิดพลาด', 'ข้อมูลเวลาไม่ถูกต้องโปรดระบุใหม่อีกครั้ง')
        }

        const now: Date = new Date();

        const diffInMilliseconds = scheduleDateTime.getTime() - now.getTime();
        const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

        if (diffInHours < 2) {
            return Alert.alert('ผิดพลาด', 'โปรดระบุเวลานัดหมายล่วงหน้า 2 ชั่วโมงขึ้นไป')
        }


        try {
            const response = await axios.post('https://friendszone.app/api/schedule', {
                customerId: userData.id,
                memberId: userProfile?.profile.id,
                date: scheduleDateTime,
                location: scheduleLocation,
                jobs: scheduleJobs,
                latitude: pin?.latitude,
                longtitude: pin?.longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Customer ${userData.token}`
                }
            })

            if (response.data.status != 200) {
                Alert.alert(`เกิดข้อผิดพลาด`, `ไม่สามารถสร้างนัดหมายได้`, [{ text: 'OK' }]);
            } else {
                Alert.alert(`สำเร็จ`, `สร้างนัดหมายสำเร็จ`, [{ text: 'OK' }]);
                sendPushNotification(userData?.token, userProfile?.profile.id, {
                    title: `นัดหมายใหม่`,
                    body: `${userData.username} ต้องนัดหมายกับคุณ โปรดตรวจสอบนัดหมาย`,
                    imageUrl: `${userData.profileUrl}`,
                    screen: {
                        name: "SchedulePage",
                        data: {}
                    }
                })
                navigation.navigate("SchedulePage", {});
            }
        } catch (error) {
            Alert.alert(`เกิดข้อผิดพลาด`, `ไม่สามารถสร้างนัดหมายได้`, [{ text: 'OK' }]);
        }
    }

    const ImageSlide: React.FC<{ image: string }> = ({ image }) => {
        const [loading, setLoading] = useState(true);

        return (
            <StyledView className="w-screen bg-gray-400 justify-center items-center">
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#FFFFFF"
                        style={{ position: 'absolute', zIndex: 1 }}
                    />
                )}
                <Image
                    source={{ uri: image }}
                    style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                    resizeMode="cover"
                    onLoad={() => setLoading(false)}
                />
            </StyledView>
        );
    };


    return (
        <StyledView className="flex-1 dark:bg-neutral-900">
            <HeaderApp back={
                backPage ?? 'FeedsTab'
            } searchType={
                searchType
            } />

            {
                loading ? (
                    <StyledView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
                        <ActivityIndicator size="large" color="#999" />
                    </StyledView>
                ) : (
                    <StyledScrollView>
                        <StyledView className="flex-1 mb-10">
                            <StyledView style={{
                                width: SCREEN_WIDTH,
                            }}>
                                <Carousel
                                    loop
                                    width={SCREEN_WIDTH}
                                    height={SCREEN_WIDTH * 1.5}
                                    data={images}
                                    renderItem={({ item }) => (
                                        <StyledView className="w-full h-full">
                                            <StyledImage
                                                source={{ uri: item }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </StyledView>
                                    )}
                                    onSnapToItem={setIsActive}
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    className="absolute bottom-0 left-0 right-0 h-40"
                                />

                                <StyledView className="absolute bottom-2 flex-row items-center left-2">
                                    <StyledIonIcon name="heart" color={'red'} size={40} />
                                    <StyledText className="text-[30px] text-white font-custom">{userProfile?.profile.rating}</StyledText>
                                    <StyledText className="text-[25px] text-gray-200 font-custom">({userProfile?.profile.reviews})</StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView id="Image Dot" className="absolute top-2 w-full flex-row justify-between px-2 gap-1">
                                {images.map((_, index) => (
                                    <StyledView
                                        key={index}
                                        className={`${isActive === index ? "bg-gray-300" : "bg-gray-700"} opacity-70 rounded-full h-1 flex-1`}
                                    />
                                ))}
                            </StyledView>

                            <StyledView className="px-5 py-4">
                                {/* ส่วนชื่อและข้อมูลพื้นฐาน */}
                                <StyledView className="flex-row items-center justify-between mb-3">
                                    <StyledView className="flex-row items-center">
                                        <StyledText className="text-[28px] text-black dark:text-white font-custom font-semibold">
                                            {userProfile?.profile.username}
                                        </StyledText>
                                        <StyledView className="bg-gray-100 dark:bg-neutral-800 rounded-full px-3 py-1 ml-3">
                                            <StyledText className="text-gray-700 dark:text-gray-300 font-custom text-lg">
                                                {getAge(userProfile?.profile.birthday)}
                                            </StyledText>
                                        </StyledView>
                                        <StyledView className="ml-2">
                                            {userProfile?.profile.gender == "ชาย" ? (
                                                <LinearGradient
                                                    colors={['#4facfe', '#00f2fe']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    className="rounded-full p-2"
                                                >
                                                    <StyledIonIcon name="female" color={'white'} size={22} />
                                                </LinearGradient>
                                            ) : (
                                                <LinearGradient
                                                    colors={['#ff8df6', '#ff6b9c']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    className="rounded-full p-2"
                                                >
                                                    <StyledIonIcon name="male" color={'white'} size={22} />
                                                </LinearGradient>
                                            )}
                                        </StyledView>
                                    </StyledView>

                                    {userProfile?.profile.type === "member" && (
                                        <StyledView className="flex-row items-center bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2">
                                            <StyledIonIcon
                                                name="location-outline"
                                                size={20}
                                                className="text-gray-600 dark:text-gray-300 mr-2"
                                            />
                                            <StyledText className="font-custom text-gray-600 dark:text-gray-300 text-base">
                                                {Number(distance.toFixed(0)) / 1000 > 10
                                                    ? `${(distance / 1000).toFixed(1)} กม.`
                                                    : `10 กม.`}
                                            </StyledText>
                                        </StyledView>
                                    )}
                                </StyledView>

                                {/* ที่อยู่ */}
                                <StyledView className="flex-row items-center mb-4">
                                    <StyledIonIcon
                                        name="location"
                                        size={20}
                                        className="text-gray-500 dark:text-gray-400 mr-2"
                                    />
                                    <StyledText className="text-base text-gray-600 dark:text-gray-300 font-custom">
                                        {userProfile?.profile.province[0]}
                                    </StyledText>
                                </StyledView>

                                {/* Bio */}
                                {userProfile?.profile.bio && (
                                    <StyledView className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-4">
                                        <StyledText className="text-base text-gray-700 dark:text-gray-200 font-custom leading-6">
                                            {userProfile.profile.bio}
                                        </StyledText>
                                    </StyledView>
                                )}

                                {/* บริการ */}
                                <StyledView className="mt-2">
                                    <StyledText className="text-base font-semibold text-gray-500 dark:text-gray-400 font-custom mb-3">
                                        บริการ
                                    </StyledText>
                                    <StyledView className="flex-row flex-wrap">
                                        {joblist.map((job, index) => (
                                            <LinearGradient
                                                key={index}
                                                colors={['#ec4899', '#f97316']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                className="rounded-full px-4 py-2 mr-2 mb-2"
                                            >
                                                <StyledText className="font-custom text-white text-base">
                                                    {job.label}
                                                </StyledText>
                                            </LinearGradient>
                                        ))}
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledScrollView>
                )
            }

            {userProfile?.profile.type === "member" && userData.role != "member" && (
                <TouchableOpacity
                    className="w-full px-[15%] mb-4 duration-200"
                    onPress={async () => {
                        if (hasLocationPermission) {
                            if (!pin) {
                                await getCurrentLocation(); // This will call getCurrentLocation correctly
                            }
                            bottomSheetRef.current?.expand();
                        } else {
                            Alert.alert('คำเตือน', 'โปรดอนุญาตการเข้าถึงตำแหน่งเพื่อใช้ฟังก์ชั่นนี้', [
                                {
                                    text: 'ยกเลิก',
                                    style: 'destructive',
                                },
                                {
                                    text: 'ตั้งค่า',
                                    onPress: openAppSettings,
                                },
                            ]);
                        }
                    }}
                >
                    <LinearGradient
                        colors={['#EB3834', '#69140F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-full py-3 shadow-sm"
                    >
                        {[<StyledText key="scheduleCreate" className="font-custom text-center text-white text-lg font-semibold">นัดหมาย</StyledText>]}

                    </LinearGradient>
                </TouchableOpacity>
            )}

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                index={-1}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#404040" : "#fff"
                }}
            >
                <BottomSheetView style={{ height: "80%" }}>
                    <StyledView className="flex-1">
                        {
                            searchFocus ? (
                                <>
                                    <StyledView className="flex-row items-center px-6 py-2">
                                        <StyledView className="w-full px-1">
                                            <StyledView className="flex-row gap-1 items-center w-full mb-2">

                                                <StyledIonIcon name="chevron-back" size={24}
                                                    onPress={() => setSearchFocus(false)}
                                                    className="text-black dark:text-neutral-200"

                                                />
                                                <StyledTextInput
                                                    placeholder="ค้นหาสถานที่"
                                                    className="font-custom border border-gray-300 rounded-2xl py-3 mr-2 px-4 text-gray-700 dark:text-neutral-200 min-w-[80%]"
                                                    value={locationSearch}
                                                    placeholderTextColor="#d1d5db"
                                                    onChangeText={setLocationSearch}
                                                >

                                                </StyledTextInput>
                                                <StyledIonIcon
                                                    name="search"
                                                    size={24}
                                                    className="text-black dark:text-neutral-200"
                                                    onPress={() => {
                                                        setSearchFocus(true)
                                                        searchMapGeoLocation(locationSearch)
                                                    }}
                                                />

                                            </StyledView>
                                            {
                                                geoLocation.map((location, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        className="flex-row items-center py-2"
                                                        onPress={() => {
                                                            setPin(location);
                                                            setSearchFocus(false);
                                                            setScheduleLocation(location.locationName);
                                                        }}
                                                    >
                                                        <StyledIonIcon name="location-outline" size={24} className="mr-2 text-black dark:text-neutral-200" />
                                                        <StyledText className="text-lg text-black font-custom dark:text-neutral-200 flex-wrap pr-2 border-b-[1px] border-gray-200 max-w-[95%]">{location.locationName}</StyledText>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </StyledView>

                                    </StyledView>


                                </>
                            ) : showSelectJobs ? (
                                <>
                                    <StyledView className="flex-row items-center px-6 py-2">
                                        <StyledView className="w-full px-1">
                                            <StyledView className="flex-row gap-1 items-center w-full mb-2">

                                                <StyledIonIcon name="chevron-back" size={24}
                                                    onPress={() => hideSelectJob()}
                                                    className="text-black dark:text-neutral-200"

                                                />

                                            </StyledView>
                                            {
                                                joblist.map((jobs, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        className="flex-row items-center"
                                                        onPress={() => {
                                                            setScheduleJobs(jobs.value)
                                                            hideSelectJob();
                                                        }}
                                                    >
                                                        <StyledText className="text-lg text-black font-custom dark:text-neutral-200 flex-wrap pr-2 border-gray-200 max-w-[95%] bg-gray-300 dark:bg-neutral-600 px-2 py-2 rounded-xl my-2 ">{jobs.label}</StyledText>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </StyledView>

                                    </StyledView>
                                </>
                            ) : (
                                <>
                                    <StyledView className="flex-row items-center px-6 py-2">
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
                                    <StyledView className="flex-row items-center px-6 py-2">
                                        <StyledView className="w-full px-1">
                                            <StyledText className="text-lg text-black font-custom dark:text-neutral-200">
                                                ประเภทงาน
                                            </StyledText>


                                            <TouchableOpacity
                                                onPress={showSelectJob}>
                                                <StyledView
                                                    className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full dark:text-neutral-200"
                                                >
                                                    <StyledText className={`font-custom ${scheduleJobs ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleJobs ? joblist.find((j) => j.value == scheduleJobs)?.label : "เลือกประเภทงาน"}</StyledText>
                                                </StyledView>
                                            </TouchableOpacity>
                                            {/* <RNPickerSelect
                                                items={joblist}
                                                onValueChange={setScheduleJobs}
                                                value={scheduleJobs}
                                                placeholder={{ label: 'เลือกประเภทงาน', value: null }}
                                                style={{
                                                    inputIOS: {
                                                        fontFamily: 'Kanit',
                                                        width: '100%',
                                                        borderColor: '#d1d5db',
                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                        padding: 16,
                                                        borderWidth: 1,
                                                        borderRadius: 16,
                                                        zIndex: 100,
                                                    },
                                                    inputAndroid: {
                                                        fontFamily: 'Kanit',
                                                        width: '100%',
                                                        borderColor: '#d1d5db',
                                                        color: theme === 'dark' ? '#fff' : '#000',
                                                        padding: 16,
                                                        borderWidth: 1,
                                                        borderRadius: 16,
                                                    },
                                                }}
                                            /> */}
                                        </StyledView>
                                    </StyledView>

                                    <StyledView className="items-center px-6 py-2">
                                        <StyledView className="w-full px-1">
                                            <StyledText className="text-lg text-black font-custom dark:text-neutral-200">จุดนัดหมาย</StyledText>

                                            <StyledTouchableOpacity
                                                onPress={() => setSearchFocus(true)}
                                                className="font-custom border-[1px] border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full"
                                            >
                                                <StyledText className={`${scheduleLocation ? "text-black dark:text-neutral-200" : "text-gray-300"} font-custom`}>
                                                    {
                                                        scheduleLocation.length > 0 ? scheduleLocation : "ค้นหาสถานที่"
                                                    }
                                                </StyledText>
                                            </StyledTouchableOpacity>
                                        </StyledView>
                                    </StyledView>

                                    <StyledView className="px-6 py-2 rounded-2xl my-2 mt-5 h-[50%]">
                                        <StyledMapView
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
                                                height: "100%",
                                            }}
                                        >
                                            {pin && (
                                                <>
                                                    <Marker
                                                        coordinate={pin}
                                                        title="Selected Location"
                                                        draggable
                                                        onDragEnd={(e) => {
                                                            const { latitude, longitude } = e.nativeEvent.coordinate;
                                                            setPin({ latitude, longitude });
                                                        }}

                                                    >
                                                    </Marker>

                                                    <Circle
                                                        center={pin}
                                                        radius={250} // radius in meters
                                                        strokeColor="rgba(255, 0, 0, 0.5)" // Border color
                                                        fillColor="rgba(255, 0, 0, 0.2)" // Fill color
                                                    />
                                                </>
                                            )}
                                        </StyledMapView>
                                    </StyledView>


                                    <TouchableOpacity
                                        className="w-full px-6"
                                        onPress={() => {
                                            if (joblist.length <= 0) {
                                                Alert.alert("ข้อผิดพลาด", "สมาชิกนี้ยังไม่มีประเภทงานที่รองรับ", [{ text: "OK" }])
                                                return;
                                            } else {
                                                createSchedule();
                                            }
                                        }}
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
                                                <StyledText className="font-custom text-center text-white text-lg font-semibold">ส่ง</StyledText>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            )
                        }
                    </StyledView>
                </BottomSheetView>
            </BottomSheet>

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
        </StyledView>
    );
}
