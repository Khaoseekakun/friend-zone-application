// ส่งวีดีโอไม่เป็นอะ ฝากหน่อยนะ

import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView, Alert, Appearance } from "react-native";
import { styled } from "nativewind";
import { Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ResizeMode, Video } from 'expo-av';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledInput = styled(TextInput);
const StyledIonicons = styled(Ionicons);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

interface UserProfile {
    id: string;
    username: string;
    images: string[];
    bio: string;
    education: string;
    location: string;
    height: number;
    weight: number;
    services: string[];
    previewAllImageUrl: string[];
}

interface ServiceOption {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const GRADIENT_START = '#ec4899';
const GRADIENT_END = '#f97316';

const SERVICE_OPTIONS: ServiceOption[] = [
    { id: 'friend_date', name: 'นัดเพื่อน', icon: 'calendar-outline' },
    { id: 'friend_service', name: 'บริการเพื่อน', icon: 'people-outline' },
    { id: 'tour_guide', name: 'ไกด์ท่องเที่ยว', icon: 'map-outline' },
    { id: 'shopping_friend', name: 'เพื่อนช้อปปิ้ง', icon: 'cart-outline' },
    { id: 'game_friend', name: 'เพื่อนเล่นเกม', icon: 'game-controller-outline' }
];

export default function AccountSetting() {
    const navigation = useNavigation<any>();


    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState("");
    const [location, setLocation] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Image States
    const [oldImages, setOldImages] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);

    // Video States
    const [video, setVideo] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTimer, setUploadTimer] = useState<NodeJS.Timeout | null>(null);

    // UI States
    const [isUpdated, setIsUpdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const UploadingVideo = () => {
        setUploading(true);
        setUploadProgress(0);

        const timer = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setUploading(false);
                    setVideo('https://nopparat.pro/video.mp4');
                    return prev;
                }
                return prev + (100 / 15);
            });
        }, 1000);

        setUploadTimer(timer);
    };

    const cancleUpload = () => {
        if (uploadTimer) {
            clearInterval(uploadTimer);
        }
        setUploading(false);
        setUploadProgress(0);
        setUploadTimer(null);
    };
    const [theme, setTheme] = useState(Appearance.getColorScheme());
  
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });
  
        return () => listener.remove();
    }, []);


    useEffect(() => {
        fetchUserData();
    }, []);

    const handleVideoPick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('ข้อผิดพลาด', 'ต้องการการอนุญาตเข้าถึงคลังรูปภาพ');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1,
                videoMaxDuration: 30,
            });

            if (!result.canceled) {
                const response = await fetch(result.assets[0].uri);
                const blob = await response.blob();
                const fileSize = blob.size / (1024 * 1024);

                if (fileSize > 50) {
                    Alert.alert('ข้อผิดพลาด', 'ขนาดไฟล์วิดีโอต้องไม่เกิน 50MB');
                    return;
                }

                // setVideo(result.assets[0].uri);
                setUploading(true);
                setUploadProgress(0);

                const timer = setInterval(() => {
                    setUploadProgress((prev) => {
                        if (prev >= 100) {
                            clearInterval(timer);
                            setUploading(false);
                            return prev;
                        }
                        return prev + (100 / 5);
                    });
                }, 1000);

                setUploadTimer(timer);
            }
        } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวิดีโอได้ กรุณาลองใหม่อีกครั้ง');
            setUploading(false);
            setUploadProgress(0);
            setUploadTimer(null);
        }
    };

    // Check for changes in data
    useEffect(() => {
        const hasChanges =
            JSON.stringify(images) !== JSON.stringify(oldImages) ||
            JSON.stringify(selectedServices) !== JSON.stringify(profileData?.services) ||
            bio !== profileData?.bio ||
            education !== profileData?.education ||
            location !== profileData?.location ||
            height !== profileData?.height?.toString() ||
            weight !== profileData?.weight?.toString();

        setIsUpdated(hasChanges);
    }, [images, selectedServices, bio, education, location, height, weight]);

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            const response = await axios.get<{ status: number; data: { profile: UserProfile } }>(
                `https://friendszone.app/api/profile/${userList.id}`,
                {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                }
            );

            if (response.data.status === 200) {
                const profile = response.data.data.profile;
                setProfileData(profile);
                setUsername(profile.username || "");
                setBio(profile.bio || "");
                setEducation(profile.education || "");
                setLocation(profile.location || "");
                setHeight(profile.height?.toString() || "");
                setWeight(profile.weight?.toString() || "");
                setSelectedServices(profile.services || []);
                setImages(profile.previewAllImageUrl || []);
                setOldImages(profile.previewAllImageUrl || []);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const optimizeImage = async (uri: string): Promise<string | null> => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }],
                {
                    compress: 0.7,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true
                }
            );
            return manipResult.base64 || null;
        } catch (error) {
            console.error("Error optimizing image:", error);
            return null;
        }
    };

    const handleImagePick = async (useCamera = false) => {
        try {
            const { status } = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                alert(useCamera ? 'ต้องการการเข้าถึงกล้อง' : 'ต้องการการเข้าถึงคลังรูปภาพ');
                return;
            }

            const result = await (useCamera
                ? ImagePicker.launchCameraAsync
                : ImagePicker.launchImageLibraryAsync)({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [6, 4],
                    quality: 1
                });

            if (!result.canceled && result.assets[0]) {
                const optimizedBase64 = await optimizeImage(result.assets[0].uri);
                if (optimizedBase64) {
                    setImages(prev => [...prev, optimizedBase64]);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('เกิดข้อผิดพลาดในการเลือกรูปภาพ');
        }
    };

    const deleteImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const saveProfile = async () => {
        try {
            setLoadingUpdate(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            await axios.put(
                `https://friendszone.app/api/profile/${userList.id}`,
                {
                    bio,
                    education,
                    location,
                    height: Number(height),
                    weight: Number(weight),
                    images,
                    services: selectedServices
                },
                {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                }
            );

            setIsUpdated(false);
            setOldImages(images);
            await fetchUserData();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoadingUpdate(false);
        }
    };

    const resetChanges = () => {
        if (profileData) {
            setBio(profileData.bio || "");
            setEducation(profileData.education || "");
            setLocation(profileData.location || "");
            setHeight(profileData.height?.toString() || "");
            setWeight(profileData.weight?.toString() || "");
            setSelectedServices(profileData.services || []);
            setImages(profileData.previewAllImageUrl || []);
        }
    };

    if (loading) {
        return (
            <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-950 items-center justify-center">
                <ActivityIndicator size="large" color="#999" />
            </StyledView>
        );
    }

    return (
        <StyledKeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-gray-100 dark:bg-neutral-950"
        >
            <StyledView className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS === "ios" ? "mt-8" : "mt-8"} ${Platform.OS === "ios" ? "h-[80px]" : "h-[80px]"}`}>
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => navigation.goBack()}
                >
                    <StyledText className="font-custom text-gray-500 dark:text-white text-lg">
                        กลับ
                    </StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white  text-lg font-custom">
                    แก้ไข
                </StyledText>

                <TouchableOpacity
                    className="absolute right-4"
                    onPress={saveProfile}
                    disabled={!isUpdated || loadingUpdate}
                >
                    <StyledText className={`font-custom text-lg ${(!isUpdated || loadingUpdate) ? 'text-gray-400' : 'text-blue-500'}`}>
                        เสร็จสิ้น
                    </StyledText>
                </TouchableOpacity>
            </StyledView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <StyledView className="px-4 py-4 space-y-6 mb-16">
                    <StyledView className="self-center ">
                        <TouchableOpacity
                            onPress={() => handleImagePick(false)}
                            className=""
                        >
                            <StyledView className="w-[100px] h-[100px] rounded-full bg-gray-200 dark:bg-neutral-800 border-[1px] border-neutral-300 dark:border-neutral-700 border-dashed items-center justify-center">
                                <StyledIonicons
                                    name={
                                        'camera-outline'
                                    }
                                    size={40}
                                    className="text-gray-500">
                                </StyledIonicons>
                            </StyledView>

                            <StyledText className="mt-2 font-custom text-gray-600">อัปโหลดรูปภาพ</StyledText>
                        </TouchableOpacity>
                    </StyledView >
                    <StyledView className="border-b-[1px] border-gray-200"></StyledView>
                    <StyledView>
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            รูปภาพน่าสนใจ
                        </StyledText>
                        <StyledView className="flex-row flex-wrap">
                            {images.map((image, index) => (
                                <StyledView key={index} className="w-4/12 aspect-[3/4] p-1">
                                    <StyledImage
                                        source={{
                                            uri: image?.startsWith('https://')
                                                ? image
                                                : `data:image/jpeg;base64,${image}`
                                        }}
                                        className="rounded-2xl w-full h-full"
                                    />
                                    <StyledTouchableOpacity
                                        onPress={() => deleteImage(index)}
                                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                                    >
                                        <StyledIonicons name="close" size={15} className="font-custom text-white" />
                                    </StyledTouchableOpacity>
                                </StyledView>
                            ))}
                            {images.length < 9 && (
                                <TouchableOpacity
                                    onPress={() => handleImagePick(false)}
                                    className="w-4/12 aspect-[3/4] p-1"
                                >
                                    <StyledView className="flex-1 rounded-xl bg-white dark:bg-neutral-800 items-center justify-center border border-neutral-300 dark:border-neutral-700 border-dashed">
                                        <StyledIonicons name="add" size={40} className="font-custom text-black dark:text-white" />
                                    </StyledView>
                                </TouchableOpacity>
                            )}
                        </StyledView>
                    </StyledView>
                    <StyledView>
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            วิดีโอแนะนำตัว
                        </StyledText>
                        <StyledView className="w-full aspect-video mb-4">
                            {video ? (
                                <StyledView className="relative w-full h-full">
                                    <Video
                                        source={{ uri: video }}
                                        resizeMode={ResizeMode.COVER}
                                        className="w-full h-full rounded-2xl"
                                        useNativeControls
                                    />
                                    <StyledTouchableOpacity
                                        onPress={() => setVideo(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 z-10"
                                    >
                                        <StyledIonicons name="close" size={18} className="text-white" />
                                    </StyledTouchableOpacity>
                                </StyledView>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleVideoPick}
                                    className="w-full h-full"
                                >
                                    <StyledView className="flex-1 rounded-xl bg-white dark:bg-neutral-800 items-center justify-center border border-neutral-300 dark:border-neutral-700 border-dashed">
                                        <StyledIonicons name="videocam-outline" size={40} className="text-black dark:text-white mb-2" />
                                        <StyledText className="font-custom text-neutral-500 dark:text-neutral-400">
                                            อัพโหลดวิดีโอ (ไม่เกิน 100 MB.)
                                        </StyledText>
                                    </StyledView>
                                </TouchableOpacity>
                            )}
                        </StyledView>
                    </StyledView>

                    <StyledView>
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            ชื่อผู้ใช้
                        </StyledText>
                        <StyledInput
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mb-2 "
                            placeholder="ชื่อผู้ใช้"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            เกี่ยวกับฉัน
                        </StyledText>
                        <StyledInput
                            multiline
                            numberOfLines={4}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom "
                            placeholder="เล่าเรื่องราวของคุณ..."
                            placeholderTextColor="#666"
                            value={bio}
                            onChangeText={setBio}
                        />
                    </StyledView>

                    <StyledView className="space-y-3">
                        <StyledView className="space-y-2">
                            <StyledText className="font-custom text-neutral-400 text-sm ml-1">
                                ที่อยู่ปัจจุบัน
                            </StyledText>

                            <TouchableOpacity className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden">
                                <StyledView className="flex-row items-center p-3 border-l-4 border-pink-500">
                                    <StyledView className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full items-center justify-center">
                                        <StyledIonicons
                                            name="location-outline"
                                            size={24}
                                            className="text-pink-500"
                                        />
                                    </StyledView>

                                    <StyledView className="flex-1 ml-3">
                                        <StyledInput
                                            className="dark:text-white font-custom text-base"
                                            value={location}
                                            onChangeText={setLocation}
                                            placeholder="กรุณาระบุที่อยู่ของคุณ"
                                            placeholderTextColor="#666"
                                        />
                                    </StyledView>

                                    <StyledIonicons
                                        name="chevron-forward"
                                        size={20}
                                        className="text-neutral-400"
                                    />
                                </StyledView>
                            </TouchableOpacity>
                        </StyledView>

                        <StyledView className="space-y-4">
                            <StyledView className="flex-row space-x-3">
                                <StyledView className="flex-1">
                                    <StyledText className="font-custom text-neutral-400 text-sm mb-2">
                                        ส่วนสูง
                                    </StyledText>
                                    <StyledView className="bg-white dark:bg-neutral-800 rounded-xl p-3 flex-row items-center justify-between">
                                        <StyledView className="flex-row items-center space-x-2">
                                            <StyledIonicons
                                                name="body-outline"
                                                size={20}
                                                className="text-neutral-400"
                                            />
                                            <StyledInput
                                                className="flex-1 dark:text-white font-custom text-base"
                                                value={height}
                                                onChangeText={setHeight}
                                                placeholder="0"
                                                placeholderTextColor="#666"
                                                keyboardType="numeric"
                                            />
                                        </StyledView>
                                        <StyledText className="text-neutral-400 font-custom -ml-14">
                                            ซม.
                                        </StyledText>
                                    </StyledView>
                                </StyledView>

                                <StyledView className="flex-1">
                                    <StyledText className="font-custom text-neutral-400 text-sm mb-2">
                                        น้ำหนัก
                                    </StyledText>
                                    <StyledView className="bg-white dark:bg-neutral-800 rounded-xl p-3 flex-row items-center justify-between">
                                        <StyledView className="flex-row items-center space-x-2">
                                            <StyledIonicons
                                                name="scale-outline"
                                                size={20}
                                                className="text-neutral-400"
                                            />
                                            <StyledInput
                                                className="flex-1 dark:text-white font-custom text-base"
                                                value={weight}
                                                onChangeText={setWeight}
                                                placeholder="0"
                                                placeholderTextColor="#666"
                                                keyboardType="numeric"
                                            />
                                        </StyledView>
                                        <StyledText className="text-neutral-400 font-custom -ml-14">
                                            กก.
                                        </StyledText>
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                    <StyledView>
                        <StyledText className="font-custom text-neutral-400 text-base mb-3">
                            บริการของฉัน
                        </StyledText>
                        <StyledView className="flex-row flex-wrap gap-2">
                            {SERVICE_OPTIONS.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    onPress={() => toggleService(service.id)}
                                    className={`flex-row items-center rounded-full px-4 py-2 border ${selectedServices.includes(service.id)
                                        ? 'border-transparent'
                                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                                        }`}
                                    style={selectedServices.includes(service.id) ? {
                                        backgroundColor: GRADIENT_START,
                                        borderWidth: 0,
                                    } : {}}
                                >
                                    <StyledIonicons
                                        name={service.icon}
                                        size={20}
                                        className={selectedServices.includes(service.id) ? 'text-white' : 'text-neutral-600 dark:text-white'}
                                    />
                                    <StyledText className={`ml-2 ${selectedServices.includes(service.id)
                                        ? 'text-white'
                                        : 'text-neutral-600 dark:text-white'
                                        }`}>
                                        {service.name}
                                    </StyledText>
                                </TouchableOpacity>
                            ))}
                        </StyledView>
                    </StyledView>
                </StyledView>
            </ScrollView>

            {isUpdated && (
                <StyledView className="absolute bottom-5 w-full px-2">
                    <StyledView className="flex-row justify-between w-full">
                        <StyledView className="flex-1 mx-1">
                            <StyledTouchableOpacity
                                className="rounded-full bg-gray-400 py-2 items-center"
                                onPress={resetChanges}
                                disabled={loadingUpdate}
                            >
                                <StyledText className="font-custom text-white text-lg">
                                    คืนค่า
                                </StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>
                        <StyledView className="flex-1 mx-1">
                            <TouchableOpacity
                                onPress={saveProfile}
                                disabled={loadingUpdate}
                                className="w-full"
                            >
                                <LinearGradient
                                    colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-full py-2 items-center"
                                >
                                    {loadingUpdate ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <StyledText className="font-custom text-white text-lg">
                                            บันทึก
                                        </StyledText>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </StyledView>
                    </StyledView>
                </StyledView>
            )}
        </StyledKeyboardAvoidingView>
    );
}