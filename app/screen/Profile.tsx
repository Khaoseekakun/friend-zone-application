import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { View, Text, Alert, ActivityIndicator, ScrollView, Dimensions, Image } from "react-native";
import { styled } from "nativewind";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import { NavigationProp, RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import axios from "axios";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { getAge } from "@/utils/Date";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledIonIcon = styled(Ionicons);
type ProfileParam = RouteProp<RootStackParamList, 'ProfileTab'>;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function ProfileTab() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<ProfileParam>();
    const { profileId } = route.params;

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["95%"], []);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userData, setUserData] = useState<any>({});
    const [isActive, setIsActive] = useState(0);

    const [images, setImages] = useState<string[]>([
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400",
        "https://placehold.co/600x400"
    ]);

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
                    "Authorization": `Bearer ${parsedData?.token}`
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
    }, [fetchUserData]);

    const onGestureEvent = ({ nativeEvent }: any) => {
        if (nativeEvent.translationX < -50 && isActive < images.length - 1) {
            // Swipe left
            setIsActive((prev) => prev + 1);
        } else if (nativeEvent.translationX > 50 && isActive > 0) {
            // Swipe right
            setIsActive((prev) => prev - 1);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(-isActive * SCREEN_WIDTH) }],
    }));

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
                    </StyledView>

                    <StyledView className="left-2">
                        <StyledText className="text-[25px] text-black font-custom">Bio</StyledText>
                        <StyledText className="text-lg text-gray-700 font-custom">ดูแลดีไม่เชื่อลองนัด</StyledText>
                    </StyledView>
                </StyledView>
            </StyledScrollView>



            {userProfile.profile.type === "member" && (
                <TouchableOpacity
                    className="w-full px-[15%] mb-4 duration-200"
                    onPress={() => bottomSheetRef.current?.expand()}
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
                <BottomSheetView style={{ height: "100%" }}>
                    <StyledView className="flex-1 bg-white">
                        <StyledView className="mt-5 bg-gray-100 rounded-lg mx-5">

                        </StyledView>


                    </StyledView>
                </BottomSheetView>
            </BottomSheet>
        </StyledView>
    );
}
