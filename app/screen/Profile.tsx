import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, ScrollView, Dimensions, Image, Linking, Appearance, Platform, TouchableNativeFeedback, Keyboard, TouchableWithoutFeedback, StyleSheet } from "react-native";
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
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
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
import { Modal, Animated } from 'react-native';
import { JobMembers, Review } from "@/types/prismaInterface";
import { set } from "firebase/database";

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
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
type ProfileParam = RouteProp<RootStackParamList, 'ProfileTab'>;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function ProfileTab() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<ProfileParam>();
    const { profileId, jobCategory, backPage } = route.params;
    const isFoucs = useIsFocused()

    const bottomSheetRef = useRef<BottomSheet>(null);
    const bottomSheetRefReview = useRef<BottomSheet>(null);

    const snapPoints = ["80%"];
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
    const [scheduleNote, setScheduleNote] = useState('');
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
    const [reviewList, setReviewList] = useState<Review[]>([]);

    const [locationSearch, setLocationSearch] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("");


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

            if (userProfile?.profile?.pinLocation) {
                setDistance(getDistanceMemberToCustomer({ latitude: location.coords.latitude, longitude: location.coords.longitude }, {
                    latitude: parseFloat(userProfile.profile.pinLocation[0]),
                    longitude: parseFloat(userProfile.profile.pinLocation[1])
                }));
            }
        }
    };


    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [reviewText, setReviewText] = useState('');
    const [reviewStars, setReviewStars] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const showModal = () => {
        setModalVisible(true);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const hideModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setModalVisible(false));
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
            const newLocations = response.data.features?.map((feature: any) => ({
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
                locationName: feature.properties.formatted || location
            }));

            setGeoLocation(newLocations);

        } catch (error) {
        }
    }

    const loadJobsList = async () => {
        try {
            if (!jobCategory) {
                if (userProfile?.profile?.JobMembers?.length > 0) {
                    const resdata = await axios.get(`http://49.231.43.37:3000/api/jobs?jobId=${userProfile?.profile?.JobMembers[0].jobId}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `All ${userData.token}`
                        }
                    })

                    if (resdata.data.status == 200) {
                        setJobList(resdata.data.data.JobsList?.map((job: any) => ({
                            label: job.jobName,
                            value: job.id,

                        })))
                    }
                }
            } else {
                const resdata = await axios.get(`http://49.231.43.37:3000/api/jobs?categoryType=${jobCategory}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `All ${userData.token}`
                    }
                })

                if (resdata.data.status == 200) {
                    setJobList(resdata.data.data.JobsList?.map((job: any) => ({
                        label: job.jobName,
                        value: job.id,

                    })))

                }
            }


        } catch (error) {
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

            const user = await axios.get(`http://49.231.43.37:3000/api/profile/${profileId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${parsedData?.token}`
                }
            });


            setUserProfile(user.data.data);
            setImages(user.data.data?.profile.previewAllImageUrl)
            setIsActive(0);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [profileId, navigation]);

    useEffect(() => {
        if (isFoucs != false) {
            if (loading === false) {
                loadReview();
            } else {
                fetchUserData();
                requestLocationPermission();
            }

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
            setLoadingMessage('กำลังสร้างนัดหมาย...');
            setIsLoading(true);
            const response = await axios.post('http://49.231.43.37:3000/api/schedule', {
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
        finally {
            setIsLoading(false);
        }
    }

    const sendReview = async () => {
        if (!reviewText) {
            return Alert.alert('ข้อมูลไม่ครบ', 'โปรดกรอกข้อมูลให้ครบถ้วน', [{ text: 'OK' }]);
        }

        try {
            setLoadingMessage('กำลังสร้างรีวิว...');
            setIsLoading(true);
            const response = await axios.post(`http://49.231.43.37:3000/api/profile/${userProfile?.profile.id}/review`, {
                userId: userData.id,
                star: reviewStars,
                text: reviewText
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData.token}`
                }
            });

            if (response.data.status != 200) {
                Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรีวิวได้', [{ text: 'OK' }]);
            } else {
                setLoadingMessage('สร้างรีวิวสำเร็จ');
                fetchUserData();
                setShowReviewModal(false);
                setReviewStars(0);
                setReviewText('');
                bottomSheetRefReview.current?.close()
            }

        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรีวิวได้', [{ text: 'OK' }]);
        } finally {
            setIsLoading(false);
        }
    }

    const loadReview = async () => {
        try {
            setLoadingReviews(true);
            const response = await axios.get(`http://49.231.43.37:3000/api/profile/${userProfile?.profile.id}/review`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData.token}`
                }
            });

            if (response.data.status == 200) {
                setReviewList(response.data.data);
            }
        } catch (error) {
        }
    }

    return (
        <StyledView className="flex-1 dark:bg-neutral-900">
            <HeaderApp back={
                backPage ?? 'FeedsTab'
            } />

            {
                loading ? (
                    <StyledView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
                        <ActivityIndicator size="large" color="#999" />
                    </StyledView>
                ) : (
                    <>
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
                                        <StyledIonIcon name="heart" color={'#ad2722'} size={40} />
                                        <StyledText className="text-[30px] text-white font-custom">{(reviewList.reduce((acc, review) => acc + review.star, 0) / reviewList.length).toFixed(1)}</StyledText>
                                        <StyledText className="text-[20px] text-gray-200 font-custom ml-1 mt-2">({reviewList.length})</StyledText>
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

                                    <StyledText className="text-[28px] text-black dark:text-white font-custom font-semibold mb-3">
                                        {userProfile?.profile?.username}
                                    </StyledText>
                                    <StyledView className="mb-3">
                                        <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-sm mb-2">
                                            ข้อมูลพื้นฐาน
                                        </StyledText>

                                        <StyledView className="flex-row items-center justify-between mb-3">
                                            <StyledView className="flex-row items-center">
                                                <StyledIonIcon
                                                    name={userProfile?.profile?.gender === "ชาย" ? "male" : "female"}
                                                    size={20}
                                                    className={userProfile?.profile?.gender === "ชาย" ? "text-blue-500" : "text-pink-500"}
                                                    style={{ marginRight: 8 }}
                                                />
                                                <StyledText className="text-gray-700 dark:text-gray-300 font-custom text-base">
                                                    {userProfile?.profile?.gender}
                                                </StyledText>
                                            </StyledView>

                                            <StyledView className="flex-row items-center">
                                                <StyledIonIcon
                                                    name="calendar-outline"
                                                    size={20}
                                                    className="text-gray-500 dark:text-gray-400 mr-2"
                                                />
                                                <StyledText className="text-gray-700 dark:text-gray-300 font-custom text-base">
                                                    {getAge(userProfile?.profile?.birthday)} ปี
                                                </StyledText>
                                            </StyledView>

                                            <StyledView className="flex-row items-center">
                                                <StyledIonIcon
                                                    name="location-outline"
                                                    size={20}
                                                    className="text-gray-500 dark:text-gray-400 mr-2"
                                                />
                                                <StyledText className="text-gray-700 dark:text-gray-300 font-custom text-base">
                                                    {userProfile?.profile?.Province?.name ?? 'ข้อมูลที่ไม่รู้จัก'}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>

                                        <StyledView className="flex-row justify-around bg-gray-100 dark:bg-neutral-700 rounded-xl p-3">
                                            <StyledView className="items-center">
                                                <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-sm mb-1">
                                                    ส่วนสูง
                                                </StyledText>
                                                <StyledView className="flex-row items-center">
                                                    <StyledText className="text-gray-700 dark:text-gray-200 font-custom text-base font-semibold">
                                                        {userProfile?.profile?.height || 170}
                                                    </StyledText>
                                                    <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-sm ml-1">
                                                        ซม.
                                                    </StyledText>
                                                </StyledView>
                                            </StyledView>

                                            <StyledView className="items-center">
                                                <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-sm mb-1">
                                                    น้ำหนัก
                                                </StyledText>
                                                <StyledView className="flex-row items-center">
                                                    <StyledText className="text-gray-700 dark:text-gray-200 font-custom text-base font-semibold">
                                                        {userProfile?.profile?.weight || 60}
                                                    </StyledText>
                                                    <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-sm ml-1">
                                                        กก.
                                                    </StyledText>
                                                </StyledView>
                                            </StyledView>
                                        </StyledView>
                                    </StyledView>

                                    {userProfile?.profile?.type === "member" && (
                                        <StyledView className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-4">
                                            <StyledView className="flex-row items-center justify-between">
                                                <StyledText className="text-gray-600 dark:text-gray-400 font-custom text-base">
                                                    ระยะห่าง
                                                </StyledText>
                                                <StyledText className="text-black dark:text-white font-custom text-lg font-semibold">
                                                    {/* {Number(distance.toFixed(0)) / 1000 > 10
                                                        ? `${(distance / 1000).toFixed(1)} กม.`
                                                        : `${(distance / 1000).toFixed(1)} กม.`} */}
                                                    {isNaN(distance) ? '0.0 กม.' :
                                                        `${(distance / 1000).toFixed(1)} กม.`}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>
                                    )}

                                    {userProfile?.profile?.bio && (
                                        <StyledView className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-4">
                                            <StyledText className="text-base text-gray-700 dark:text-gray-200 font-custom leading-6">
                                                {userProfile?.profile?.bio}
                                            </StyledText>
                                        </StyledView>
                                    )}

                                    <StyledView className="mt-2">
                                        <StyledText className="text-base font-semibold text-gray-500 dark:text-gray-400 font-custom mb-3">
                                            บริการ
                                        </StyledText>
                                        <StyledView className="flex-row flex-wrap">
                                            {userProfile.profile.JobMembers.map((job: JobMembers, index: number) => (
                                                <LinearGradient
                                                    key={index}
                                                    colors={['#ec4899', '#f97316']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    className="rounded-full px-4 py-2 mr-2 mb-2"
                                                >
                                                    <StyledText className="font-custom text-white text-base">
                                                        {job.jobs?.jobName ?? 'ไม่ระบุ'}
                                                    </StyledText>
                                                </LinearGradient>
                                            ))}
                                        </StyledView>
                                    </StyledView>
                                    <StyledView className="px-2 py-4 border-t-[1px] border-neutral-300 mt-2">
                                        {/* หัวข้อรีวิว */}
                                        <StyledView className="flex-row items-center justify-between mb-6">
                                            <StyledView className="flex-row items-center">
                                                <StyledText className="text-xl font-semibold text-black dark:text-white font-custom">
                                                    รีวิวทั้งหมด
                                                </StyledText>
                                                <StyledView className="bg-red-50 dark:bg-red-900/30 rounded-full px-3 py-1 ml-2">
                                                    <StyledText className="text-red-500 dark:text-red-400 font-custom">
                                                        {reviewList?.length}
                                                    </StyledText>
                                                </StyledView>
                                            </StyledView>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    bottomSheetRefReview.current?.expand()
                                                }}
                                                className="flex-row items-center"
                                            >
                                                <StyledIonIcon
                                                    name="create-outline"
                                                    size={20}
                                                    className="text-red-500 mr-1"
                                                />
                                            </TouchableOpacity>
                                        </StyledView>

                                        {/* สรุปคะแนนรีวิว */}
                                        <StyledView className="bg-red-100/80 dark:bg-red-900/10 rounded-2xl p-4 mb-6">
                                            <StyledView className="flex-row items-center justify-between">
                                                <StyledView>
                                                    <StyledText className="text-4xl font-bold text-red-600 dark:text-red-500 font-custom">
                                                        {
                                                            reviewList?.length > 0 ? (Number(reviewList.reduce((prev: number, current: any) => prev + current.star, 0)) / reviewList?.length).toFixed(1) : 0
                                                        }

                                                    </StyledText>
                                                    <StyledView className="flex-row mt-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StyledIonIcon
                                                                key={star}
                                                                name="star"
                                                                size={16}
                                                                className={`text-red-500 ${star <= (reviewList?.length > 0 ? Number(reviewList.reduce((prev: number, current: any) => prev + current.star, 0)) / reviewList?.length : 0) ? "text-red-500" : "text-gray-300"} mr-0.5`}
                                                            />
                                                        ))}
                                                    </StyledView>
                                                </StyledView>
                                            </StyledView>
                                        </StyledView>

                                        {/* รายการรีวิว */}
                                        {
                                            reviewList?.length > 0 ?
                                                reviewList?.map((review: Review) => (
                                                    <StyledView
                                                        key={review.id}
                                                        className="border-b border-gray-100 dark:border-neutral-800 py-4"
                                                    >
                                                        <StyledView className="flex-row justify-between items-start mb-3">
                                                            <StyledView className="flex-row items-center">
                                                                <StyledImage
                                                                    source={{ uri: review.userType == "Member" ? review.MemberDB?.profileUrl ?? undefined : review.CustomersDB?.profileUrl ?? undefined }}
                                                                    className="w-10 h-10 rounded-full mr-3"
                                                                />
                                                                <StyledView>
                                                                    <StyledText className="font-bold text-base text-black dark:text-white font-custom mb-1">
                                                                        {review.userType == "Member" ? review.MemberDB?.username : review.CustomersDB?.username}
                                                                    </StyledText>
                                                                    <StyledView className="flex-row items-center">
                                                                        {[1, 2, 3, 4, 5]?.map((star) => (
                                                                            <StyledIonIcon
                                                                                key={star}
                                                                                name={star <= review.star ? "star" : "star-outline"}
                                                                                size={14}
                                                                                className={star <= review.star ? "text-red-500 mr-0.5" : "text-gray-300 mr-0.5"}
                                                                            />
                                                                        ))}
                                                                        <StyledText className="text-gray-400 text-sm font-custom ml-2">
                                                                            {new Date(review.createdAt).toDateString()}
                                                                        </StyledText>
                                                                    </StyledView>
                                                                </StyledView>
                                                            </StyledView>
                                                        </StyledView>

                                                        <StyledText className="text-gray-600 dark:text-gray-300 font-custom leading-6 ml-15">
                                                            {review.text}
                                                        </StyledText>
                                                    </StyledView>
                                                )) : (
                                                    <StyledText className="text-gray-500 dark:text-gray-400 font-custom text-center">
                                                        ยังไม่มีรีวิว
                                                    </StyledText>
                                                )
                                        }




                                        {/* เพิ่ม Modal Component */}

                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </StyledScrollView>
                    </>
                )
            }

            {userProfile?.profile?.id !== userData.id && (
                <TouchableOpacity
                    className="w-full px-[15%] mb-4 duration-200 absolute bottom-0"
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
                    backgroundColor: theme == "dark" ? "#262626" : "#fff"
                }}
            >
                <BottomSheetScrollView>
                    <StyledView className="flex-1 mb-20">
                        {
                            searchFocus ? (
                                <>
                                    <StyledView className="flex-row items-center px-6 py-1 ">
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
                                                geoLocation?.map((location, index) => (
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
                                    <StyledView className="flex-row items-center px-6 py-1">
                                        <StyledView className="w-full px-1">
                                            <StyledView className="flex-row gap-1 items-center w-full mb-2">

                                                <StyledIonIcon name="chevron-back" size={24}
                                                    onPress={() => hideSelectJob()}
                                                    className="text-black dark:text-neutral-200"

                                                />

                                            </StyledView>
                                            {
                                                joblist?.map((jobs, index) => (
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
                                                    <StyledText className={`font-custom ${scheduleJobs ? 'text-gray-700 dark:text-white' : "text-[#d1d5db]"}`}>{scheduleJobs ? joblist.find((j) => j.value == scheduleJobs)?.label : "เลือกประเภทงาน"}</StyledText>
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

                                            <StyledTouchableOpacity
                                                onPress={() => setSearchFocus(true)}
                                                className="font-custom border-[1px] border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full"
                                            >
                                                <StyledText className={`${scheduleLocation ? "text-black dark:text-neutral-200" : "text-gray-300"} font-custom`}>
                                                    {
                                                        scheduleLocation?.length > 0 ? scheduleLocation : "ค้นหาสถานที่"
                                                    }
                                                </StyledText>
                                            </StyledTouchableOpacity>
                                        </StyledView>
                                    </StyledView>

                                    <StyledView className="px-6 py-1 rounded-2xl my-2 mt-5 h-[50%]">
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
                                            if (joblist?.length <= 0) {
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
                </BottomSheetScrollView>
            </BottomSheet>

            <BottomSheet
                ref={bottomSheetRefReview}
                snapPoints={["70%"]}
                enablePanDownToClose={true}
                index={-1}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#262626" : "#fff"
                }}
            >
                <BottomSheetView style={{ height: "80%" }}>
                    <TouchableWithoutFeedback
                        touchSoundDisabled={true}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    >
                        <StyledView className="flex-1justify-end">
                            <StyledView className=" rounded-t-3xl px-6">
                                <StyledView className="flex-row items-center justify-between mb-6">
                                    <StyledText className="text-2xl text-black dark:text-white font-custom">
                                        เขียนรีวิว
                                    </StyledText>
                                    <TouchableOpacity onPress={
                                        () => bottomSheetRefReview.current?.close()
                                    }>
                                        <StyledIonIcon
                                            name="close"
                                            size={24}
                                            className="text-gray-400"
                                        />
                                    </TouchableOpacity>
                                </StyledView>

                                <StyledView className="items-center mb-8">
                                    <StyledText className="text-base text-gray-600 dark:text-gray-300 font-custom mb-4">
                                        ให้คะแนนประสบการณ์ของคุณ
                                    </StyledText>
                                    <StyledView className="flex-row">
                                        {[1, 2, 3, 4, 5]?.map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setReviewStars(star)}
                                                className="mx-2"
                                            >
                                                <StyledIonIcon
                                                    name="star"
                                                    size={32}
                                                    color={
                                                        reviewStars >= star ? "#FFD700" : "#D3D3D3"
                                                    }
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </StyledView>
                                </StyledView>

                                <StyledView className="mb-8">
                                    <StyledText className="text-base text-gray-600 dark:text-gray-300 font-custom mb-2">
                                        เขียนความคิดเห็นของคุณ
                                    </StyledText>
                                    <StyledView className="bg-gray-50 dark:bg-neutral-700 rounded-2xl p-4">
                                        <TextInput
                                            multiline
                                            numberOfLines={5}
                                            value={reviewText}
                                            onChangeText={setReviewText}
                                            placeholder="แชร์ประสบการณ์ของคุณ..."
                                            placeholderTextColor="#9CA3AF"
                                            className="font-custom text-gray-700 dark:text-gray-200 min-h-[120px]"
                                            textAlignVertical="top"
                                        />
                                    </StyledView>
                                </StyledView>

                                {/* ปุ่มส่งรีวิว */}
                                <TouchableOpacity
                                    disabled={loading}
                                    onPress={() => {
                                        if (reviewStars && reviewText) {
                                            sendReview();
                                        } else {
                                            Alert.alert("ข้อมูลไม่ครบ", "โปรดกรอกข้อมูลให้ครบถ้วน", [{ text: "OK" }]);
                                        }
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#EB3834', '#69140F']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="rounded-full py-4"
                                    >
                                        <StyledText className="text-white text-center text-lg font-custom">
                                           {
                                                  loading ? <ActivityIndicator size="small" color="#fff" /> : "ส่ง"
                                           }
                                        </StyledText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
                    </TouchableWithoutFeedback>
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