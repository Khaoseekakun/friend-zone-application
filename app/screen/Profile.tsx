import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, ScrollView, Dimensions, Image, Linking } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { NavigationProp, RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import axios from "axios";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { getAge } from "@/utils/Date";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Location from 'expo-location';
import MapView, { Circle, Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const StyledMapView = styled(MapView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledIonIcon = styled(Ionicons);
const StyledTextInput = styled(TextInput);
const StyledGooglePlacesAutocomplete = styled(GooglePlacesAutocomplete);
type ProfileParam = RouteProp<RootStackParamList, 'ProfileTab'>;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function ProfileTab() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<ProfileParam>();
    const { profileId } = route.params;

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["85%"], []);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userData, setUserData] = useState<any>({});
    const [isActive, setIsActive] = useState(0);
    const [scheduleTime, setScheduleTime] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleJobs, setScheduleJobs] = useState<string[]>([]);
    const [scheduleLocation, setScheduleLocation] = useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    const [pin, setPin] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const isFocus = useIsFocused();
    const openAppSettings = () => {
        Linking.openSettings().catch(() => {
            Alert.alert('ไม่สามารถไปหน้าตั้งค่าได้', 'โปรดเปิดการอนุญาตการเข้าถึงตำแหน่ง ด้วยตัวคุณเอง');
        });
    };

    const [images, setImages] = useState<string[]>([
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400"
    ]);

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setHasLocationPermission(true);
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

    const fetchUserData = useCallback(async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedData = storedUserData ? JSON.parse(storedUserData) : null;
            setUserData(parsedData);
            if (!profileId) {
                Alert.alert("Error", "User profile not found", [
                    {
                        text: "Go to Home",
                        onPress: () => navigation.navigate("HomeScreen")
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
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, [profileId, navigation]);

    useEffect(() => {
        fetchUserData();
        if (isFocus) {

            requestLocationPermission();
        }
    }, [isFocus]);

    const onGestureEvent = ({ nativeEvent }: any) => {
        if (nativeEvent.translationX < -50 && isActive < images.length - 1) {
            setIsActive((prev) => prev + 1);
        } else if (nativeEvent.translationX > 50 && isActive > 0) {
            setIsActive((prev) => prev - 1);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(-isActive * SCREEN_WIDTH) }],
    }));


    const createSchedule = async () => {
        if (!scheduleDate || !scheduleTime) {
            return Alert.alert('ข้อมูลไม่ครบ', 'โปรดกรอกข้อมูลให้ครบถ้วน', [{ text: 'OK' }]);
        }

        const [day, month, year] = scheduleDate.split("/");
        const [hour, minute] = scheduleTime.split(":");
        const scheduleDateTime = new Date(+year, +month - 1, +day, +hour, +minute).toISOString();

        try {
            const response = await axios.post('http://49.231.43.37:3000/api/schedule', {
                customerId: userData.id,
                memberId: userProfile.profile.id,
                date: scheduleDateTime,
                location: scheduleLocation ?? "TEST",
                jobs: scheduleJobs ?? ["TEST"],
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
                navigation.navigate("ScheduleTab");
            }
        } catch (error) {
            console.error('Failed to create schedule:', error);
            Alert.alert(`เกิดข้อผิดพลาด`, `ไม่สามารถสร้างนัดหมายได้`, [{ text: 'OK' }]);
        }
    }

    if (loading) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#EB3834" />
            </StyledView>
        );
    }

    return (
        <StyledView className="flex-1 bg-white">
            <HeaderApp back="FeedsTab" />
            <StyledScrollView>
                <StyledView className="flex-1 h-screen">
                    <StyledView>

                        <PanGestureHandler onGestureEvent={onGestureEvent}>
                            <Animated.View style={[{ width: SCREEN_WIDTH * images.length, flexDirection: 'row' }, animatedStyle]}>
                                {images.map((image, index) => (
                                    <StyledView key={index} className="w-screen bg-gray-400 justify-center items-center">
                                        <Image source={{ uri: image }} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }} resizeMode="cover" />
                                    </StyledView>
                                ))}
                            </Animated.View>

                        </PanGestureHandler>
                        <StyledView className="absolute flex-row items-center bottom-0 left-2">
                            <StyledIonIcon name="heart" color={'red'} size={40} />
                            <StyledText className="text-[30px] text-white font-custom">4.1</StyledText>
                            <StyledText className="text-[25px] text-gray-200 font-custom">(1,502)</StyledText>
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

                    <StyledView className="flex-row items-center left-2">
                        <StyledText className="text-[30px] text-black font-custom">{userProfile.profile.username} {getAge(userProfile?.profile.birthday)}</StyledText>

                        {userProfile.profile.gender == "ชาย" ? (
                            <StyledIonIcon className="mt-1" name="female" color={'#69ddff'} size={30} />
                        ) : (
                            <StyledIonIcon className="mt-1" name="male" color={'#ff8df6'} size={30} />
                        )}

                        <StyledIonIcon name="chatbubble-ellipses-outline" size={24} className="right-3 absolute"
                            onPress={() => {
                                navigation.navigate("Chat", {
                                    chatName: userProfile.profile.username,
                                    helper: false,
                                    receiverId: userProfile.profile.id,
                                })
                            }}
                        ></StyledIonIcon>
                    </StyledView>

                    <StyledView className="left-2">
                        <StyledText className="text-[25px] text-black font-custom">Bio</StyledText>
                        <StyledText className="text-lg text-gray-700 font-custom">ดูแลดีไม่เชื่อลองนัด</StyledText>
                    </StyledView>
                </StyledView>
            </StyledScrollView>



            {userProfile.profile.type === "member" && userData.role != "member" && (
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
                        {[<StyledText key="login" className="font-custom text-center text-white text-lg font-semibold">นัดหมาย</StyledText>]}

                    </LinearGradient>
                </TouchableOpacity>
            )}

            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                index={-1}

            >
                <BottomSheetView style={{ height: "80%" }}>
                    <StyledView className="flex-1 bg-white">
                        <StyledView className="flex-row items-center px-6 py-2">
                            <StyledView className="w-6/12 px-1">
                                <StyledText className="text-lg text-black font-custom">วัน/เดือน/ปี</StyledText>

                                <StyledTextInput
                                    placeholder="03/10/2567"
                                    className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full"
                                    value={scheduleDate}
                                    placeholderTextColor="#9CA3AF"
                                    onPress={showDatePicker}
                                    editable={false}
                                />
                            </StyledView>

                            <StyledView className="w-6/12 px-1">
                                <StyledText className="text-lg text-black font-custom">เวลา</StyledText>
                                <StyledTextInput
                                    placeholder="10:10"
                                    className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full"
                                    value={scheduleTime}
                                    placeholderTextColor="#9CA3AF"
                                    onPress={showTimePicker}
                                    editable={false}
                                />
                            </StyledView>
                        </StyledView>
                        <StyledView className="flex-row items-center px-6 py-2">
                            <StyledView className="w-full px-1">
                                <StyledText className="text-lg text-black font-custom">ประเภทงาน</StyledText>

                                <StyledTextInput
                                    placeholder="โปรดเลือกประเภทงาน"
                                    className="font-custom border border-gray-300 rounded-2xl py-4 px-4 text-gray-700 w-full"
                                    placeholderTextColor="#9CA3AF"
                                    editable={false}
                                />
                            </StyledView>
                        </StyledView>

                        <StyledView className="flex-row items-center px-6 py-2">
                            <StyledView className="w-full px-1">
                                <StyledText className="text-lg text-black font-custom">จุดนัดหมาย</StyledText>

                                <StyledGooglePlacesAutocomplete
                                    placeholder="ค้นหาสถานที่"
                                    minLength={2}
                                    fetchDetails={true}

                                    onPress={(data, details = null) => {
                                        if (details) {
                                            console.log(details.name);
                                            const { lat, lng } = details.geometry.location;
                                            setPin({
                                                latitude: lat,
                                                longitude: lng,
                                            });
                                        }
                                    }}

                                    onFail={(error) => console.error(error)}

                                    query={{
                                        key: 'AIzaSyD_MFjeIfNZSWItzTnbzfyD_12bU1MIFIk',
                                        language: 'th',
                                    }}

                                    styles={{
                                        textInput: {
                                            height: 50,
                                            borderRadius: 16,
                                            borderWidth: 1,
                                            borderColor: '#d1d5db',
                                            color: '#374151',
                                            width: '100%',
                                            fontFamily: "Kanit"
                                        },
                                        container: {
                                            zIndex: 1000,
                                        }

                                    }}
                                />
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
                            onPress={createSchedule}
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
                    </StyledView>
                </BottomSheetView>
            </BottomSheet>

            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleTimeConfirm}
                onCancel={hideTimePicker}
                locale="th-TH"

                minimumDate={
                    scheduleDate
                        ?
                        new Date(Date.now()).getDate() == new Date(`${scheduleDate.split("/")[2]}-${scheduleDate.split("/")[1]}-${scheduleDate.split("/")[0]}`).getDate()
                            ? new Date(Date.now() + 60 * 60 * 1000)
                            : undefined
                        : new Date(Date.now() + 60 * 60 * 1000)
                }
            />

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                locale="th-TH"
                minimumDate={new Date(Date.now())}
            />
        </StyledView>
    );
}
