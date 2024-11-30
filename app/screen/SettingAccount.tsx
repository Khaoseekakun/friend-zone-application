import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledInput = styled(TextInput);
const StyledIonicons = styled(Ionicons)
interface UserProfile {
    id: string;
    images: Array<string>;
    bio: string;
    education: string;
    location: string;
    height: string;
    weight: string;
}

export default function EditProfile() {
    const navigation = useNavigation<any>();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState("");
    const [images, setImages] = useState<Array<string>>([]);
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState("");
    const [location, setLocation] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(true);
    const StyledTouchableOpacity = styled(TouchableOpacity);

    const deleteImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const userList = JSON.parse(userData);
                const response = await axios.get(`https://friendszone.app/api/profile/${userList.id}`, {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                });

                if (response.data.status === 200) {
                    const profile = response.data.data.profile;
                    setProfileData(profile);
                    setBio(profile.bio || "");
                    setUsername(profile.username || "");
                    setEducation(profile.education || "");
                    setLocation(profile.location || "");
                    setHeight(profile.height?.toString() || "");
                    setWeight(profile.weight?.toString() || "");

                    if (Array.isArray(profile.previewAllImageUrl)) {
                        setImages(profile.previewAllImageUrl);
                    } else {
                        setImages([]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const optimizeImage = async (uri: string) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [
                    { resize: { width: 800 } }
                ]
                ,
                {
                    compress: 0.7,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: true
                }

            );
            return manipResult.base64;
        } catch (error) {
            console.error("Error optimizing image: ", error);
            return uri;
        }
    };

    const handleImagePick = async (useCamera = true) => {
        try {
            const { status } = useCamera ?
                await ImagePicker.requestCameraPermissionsAsync() :
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                alert(useCamera ? 'Need camera access' : 'Need gallery access');
                return;
            }

            const result = await (useCamera ?
                ImagePicker.launchCameraAsync :
                ImagePicker.launchImageLibraryAsync)({
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [6, 4],
                    quality: 1
                });

            if (!result.canceled && result.assets[0]) {
                result.assets.forEach(async (image) => {
                    const optimizedBase64 = await optimizeImage(image.uri);
                    if (optimizedBase64) {
                        setImages(prevImages => [...prevImages, optimizedBase64] as string[]);
                    }
                })
            }
        } catch (error) {
            console.error('Image pick failed:', error);
            alert('Failed to pick image');
        }
    };

    const saveProfile = async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            await axios.put(`https://friendszone.app/api/profile/${userList.id}`,
                {
                    bio,
                    education,
                    location,
                    height,
                    weight,
                    images: images
                },
                {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                }
            );
            navigation.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
        <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-950">
            <StyledView
                className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS == "ios" ? "mt-8" : ""} ${Platform.OS == "ios" ? "h-[92px]" : "h-[60px]"}`}
            >
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => navigation.navigate("SettingTab", {})}
                >
                    <StyledText className="text-gray-500 dark:text-white font-custom text-lg">กลับ</StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white font-bold text-lg">แก้ไข</StyledText>

                <TouchableOpacity
                    className="absolute right-4"
                    onPress={saveProfile}
                >
                    <StyledText className="text-blue-500 font-custom text-lg">เสร็จสิ้น</StyledText>
                </TouchableOpacity>
            </StyledView>

            {/* Rest of the component remains the same, but use state values in components */}
            <ScrollView className="flex-1">
                <StyledText className="font-custom text-gray-500 mt-3 mb-1 pl-3">รูปภาพน่าสนใจ</StyledText>
                <StyledView className="flex-row flex-wrap px-2">
                    {images.map((image, index) => (
                        <StyledView key={`Image-${index}`} className="w-4/12 h-[180px] p-1">
                            <StyledImage
                                source={{
                                    uri: `${image?.startsWith('https://') ? image : `data:image/jpeg;base64,${image}`}`
                                }}
                                className="bg-gray-500 rounded-2xl w-full h-full"
                            />
                            <StyledTouchableOpacity
                                onPress={() => deleteImage(index)}
                                style={{ position: 'absolute', top: -3, right: -3, borderRadius: 50 }}
                                className="bg-red-500 p-1"
                            >
                                <StyledIonicons className="text-white" name="close" size={15} color="white" />
                            </StyledTouchableOpacity>
                        </StyledView>
                    ))}
                    {images.length < 9 && (
                        <TouchableOpacity
                            onPress={() => handleImagePick(false)}
                            className="w-4/12 h-[180px] p-1"
                        >
                            <StyledView className="flex-1 rounded-xl bg-white dark:bg-neutral-800 items-center justify-center border border-neutral-300 dark:border-neutral-700 border-dashed">
                                <StyledIonicons className="text-black dark:text-white" name="add" size={40} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                    )}
                </StyledView>

                <StyledView className="px-4 py-2 space-y-6">
                    <StyledView>
                        <StyledText className="text-neutral-400 text-base mb-2">เกี่ยวกับฉัน</StyledText>
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
                        <TouchableOpacity
                            className="flex-row items-center justify-between bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl"
                            onPress={() => {/* Navigation to education screen */ }}
                        >
                            <StyledView className="flex-row items-center">
                                <StyledIonicons className="text-black dark:text-white" name="school-outline" size={22} />
                                <StyledText className="dark:text-white ml-3">การศึกษา</StyledText>
                            </StyledView>
                            <StyledText className="text-neutral-500">{education || "เพิ่ม"}</StyledText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl"
                            onPress={() => {/* Navigation to location screen */ }}
                        >
                            <StyledView className="flex-row items-center">
                                <StyledIonicons className="text-black dark:text-white" name="location-outline" size={22} />
                                <StyledText className="dark:text-white ml-3">ที่อยู่</StyledText>
                            </StyledView>
                            <StyledText className="text-neutral-500">{location || "เพิ่ม"}</StyledText>
                        </TouchableOpacity>

                        <StyledView className="flex-row space-x-2">
                            <StyledInput
                                className="flex-1 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 dark:text-white text-center"
                                placeholder="ส่วนสูง"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={height}
                                onChangeText={setHeight}
                            />
                            <StyledInput
                                className="flex-1 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 dark:text-white text-center"
                                placeholder="น้ำหนัก"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                            />
                        </StyledView>
                    </StyledView>
                </StyledView>
            </ScrollView>
        </StyledView>
    );
}