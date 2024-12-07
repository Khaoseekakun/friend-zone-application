import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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

export default function EditProfile() {
    const navigation = useNavigation<any>();

    // Profile Data States
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState("");
    const [location, setLocation] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Image States
    const [images, setImages] = useState<string[]>([]);
    const [oldImages, setOldImages] = useState<string[]>([]);

    // UI States
    const [isUpdated, setIsUpdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

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
                <ActivityIndicator size="large" color="#FF3366" />
            </StyledView>
        );
    }

    return (
        <StyledKeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-gray-100 dark:bg-neutral-950"
        >
            <StyledView className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS === "ios" ? "mt-8" : ""} ${Platform.OS === "ios" ? "h-[80px]" : "h-[60px]"}`}>
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => navigation.goBack()}
                >
                    <StyledText className="text-gray-500 dark:text-white font-custom text-lg">
                        กลับ
                    </StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white font-bold text-lg">
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
                    <StyledView>
                        <StyledText className="text-neutral-400 text-base mb-2">
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
                                        <StyledIonicons name="close" size={15} className="text-white" />
                                    </StyledTouchableOpacity>
                                </StyledView>
                            ))}
                            {images.length < 9 && (
                                <TouchableOpacity
                                    onPress={() => handleImagePick(false)}
                                    className="w-4/12 aspect-[3/4] p-1"
                                >
                                    <StyledView className="flex-1 rounded-xl bg-white dark:bg-neutral-800 items-center justify-center border border-neutral-300 dark:border-neutral-700 border-dashed">
                                        <StyledIonicons name="add" size={40} className="text-black dark:text-white" />
                                    </StyledView>
                                </TouchableOpacity>
                            )}
                        </StyledView>
                    </StyledView>

                    <StyledView>
                        <StyledText className="text-neutral-400 text-base mb-2">
                            เกี่ยวกับฉัน
                        </StyledText>
                        <StyledInput
                            multiline
                            numberOfLines={4}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white"
                            placeholder="เล่าเรื่องราวของคุณ..."
                            placeholderTextColor="#666"
                            value={bio}
                            onChangeText={setBio}
                        />
                    </StyledView>

                    <StyledView className="space-y-3">
                        <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl">
                            <StyledView className="flex-row items-center">
                                <StyledIonicons name="school-outline" size={22} className="text-black dark:text-white" />
                                <StyledText className="dark:text-white ml-3">การศึกษา</StyledText>
                            </StyledView>
                            <StyledInput
                                className="flex-1 text-right dark:text-white"
                                value={education}
                                onChangeText={setEducation}
                                placeholder="เพิ่มการศึกษา"
                                placeholderTextColor="#666"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl">
                            <StyledView className="flex-row items-center">
                                <StyledIonicons name="location-outline" size={22} className="text-black dark:text-white" />
                                <StyledText className="dark:text-white ml-3">ที่อยู่</StyledText>
                            </StyledView>
                            <StyledInput
                                className="flex-1 text-right dark:text-white"
                                value={location}
                                onChangeText={setLocation}
                                placeholder="เพิ่มที่อยู่"
                                placeholderTextColor="#666"
                            />
                        </TouchableOpacity>

                        <StyledView className="flex-row space-x-2">
                            <StyledView className="flex-1">
                                <StyledView className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3">
                                    <StyledText className="text-neutral-400 text-sm mb-1">
                                        ส่วนสูง (ซม.)
                                    </StyledText>
                                    <StyledInput
                                        className="dark:text-white text-right"
                                        value={height}
                                        onChangeText={setHeight}
                                        placeholder="0"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                    />
                                </StyledView>
                            </StyledView>
                            <StyledView className="flex-1">
                                <StyledView className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3">
                                    <StyledText className="text-neutral-400 text-sm mb-1">
                                        น้ำหนัก (กก.)
                                    </StyledText>
                                    <StyledInput
                                        className="dark:text-white text-right"
                                        value={weight}
                                        onChangeText={setWeight}
                                        placeholder="0"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                    />
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                    <StyledView>
                        <StyledText className="text-neutral-400 text-base mb-3">
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
                                    colors={[GRADIENT_START, GRADIENT_END]}
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