import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
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

interface UserData {
    id: string;
    username: string;
    bio: string;
    profileImages: string[];
    education: string;
    location: string;
    height: string;
    weight: string;
}

export default function EditProfile() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [images, setImages] = useState<Array<{ uri: string, id: string }>>([]);
    const [education, setEducation] = useState("");
    const [location, setLocation] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('userData');
            if (!storedData) return;

            const userList = JSON.parse(storedData);
            const response = await axios.get(`https://api.example.com/profile/${userList.id}`, {
                headers: {
                    "Authorization": `Bearer ${userList?.token}`
                }
            });

            if (response.data.status === 200) {
                const profile = response.data.data.profile;
                setUserData(profile);
                setUsername(profile.username);
                setBio(profile.bio || "");
                setEducation(profile.education || "");
                setLocation(profile.location || "");
                setHeight(profile.height || "");
                setWeight(profile.weight || "");
                setImages(profile.profileImages.map((url: string) => ({
                    uri: url,
                    id: Date.now().toString()
                })));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async (useCamera = false) => {
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
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1
                });

            if (!result.canceled && result.assets[0]) {
                const optimizedImage = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 1080 } }],
                    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                );

                setImages(prev => [...prev, {
                    uri: optimizedImage.uri,
                    id: Date.now().toString()
                }]);
            }
        } catch (error) {
            console.error('Image pick failed:', error);
            alert('Failed to pick image');
        }
    };

    const handleSave = async () => {
        if (!userData?.id) return;

        try {
            setSaving(true);
            const storedData = await AsyncStorage.getItem('userData');
            if (!storedData) return;

            const userList = JSON.parse(storedData);
            await axios.put(`https://api.example.com/profile/${userData.id}`, {
                username,
                bio,
                images: images.map(img => img.uri),
                education,
                location,
                height,
                weight
            }, {
                headers: {
                    "Authorization": `Bearer ${userList?.token}`
                }
            });

            navigation.goBack();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StyledView className="flex-1 bg-neutral-950 items-center justify-center">
                <ActivityIndicator size="large" color="#FF3366" />
            </StyledView>
        );
    }

    return (
        <StyledView className="flex-1 bg-neutral-950">
            {/* Header */}
            <StyledView className="flex-row justify-between items-center px-4 py-3 border-b border-neutral-800 mt-11">
                <StyledText className="text-white w-20"></StyledText>
                <StyledText className="text-white font-bold text-lg">แก้ไข</StyledText>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <StyledText className="text-pink-500 font-semibold w-20 text-right">
                        {saving ? 'กำลังบันทึก...' : 'เสร็จสิ้น'}
                    </StyledText>
                </TouchableOpacity>
            </StyledView>

            <ScrollView className="flex-1">
                {/* Username */}
                <StyledView className="px-4 pt-4">
                    <StyledText className="text-neutral-400 text-base mb-2">ชื่อผู้ใช้</StyledText>
                    <StyledInput
                        className="bg-neutral-800 rounded-xl p-4 text-white"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                        placeholderTextColor="#666"
                    />
                </StyledView>

                {/* Image Grid */}
                <StyledView className="p-2 flex-row flex-wrap mt-4">
                    {images.map((img) => (
                        <StyledView key={img.id} className="w-1/3 aspect-square p-0.5">
                            <StyledView className="relative w-full h-full rounded-xl overflow-hidden">
                                <StyledImage
                                    source={{ uri: img.uri }}
                                    className="w-full h-full bg-neutral-800"
                                />
                                <TouchableOpacity
                                    onPress={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                                    className="absolute right-2 top-2 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
                                >
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
                    ))}
                    {images.length < 9 && (
                        <TouchableOpacity
                            onPress={() => handleImagePick(false)}
                            className="w-1/3 aspect-square p-0.5"
                        >
                            <StyledView className="flex-1 rounded-xl bg-neutral-800 items-center justify-center border border-neutral-700 border-dashed">
                                <Ionicons name="add" size={40} color="white" />
                            </StyledView>
                        </TouchableOpacity>
                    )}
                </StyledView>

                {/* Bio */}
                <StyledView className="px-4 py-2 space-y-6">
                    <StyledView>
                        <StyledText className="text-neutral-400 text-base mb-2">เกี่ยวกับฉัน</StyledText>
                        <StyledInput
                            multiline
                            numberOfLines={4}
                            className="bg-neutral-800 rounded-xl p-4 text-white min-h-[120px]"
                            placeholder="เล่าเรื่องราวของคุณ..."
                            placeholderTextColor="#666"
                            value={bio}
                            onChangeText={setBio}
                        />
                    </StyledView>

                    {/* Education & Location */}
                    <StyledView className="space-y-3">
                        <TouchableOpacity
                            className="flex-row items-center justify-between bg-neutral-800 px-4 py-3 rounded-xl"
                        >
                            <StyledView className="flex-row items-center">
                                <Ionicons name="school-outline" size={22} color="#fff" />
                                <StyledText className="text-white ml-3">การศึกษา</StyledText>
                            </StyledView>
                            <StyledText className="text-neutral-500">
                                {education || "เพิ่ม"}
                            </StyledText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center justify-between bg-neutral-800 px-4 py-3 rounded-xl"
                        >
                            <StyledView className="flex-row items-center">
                                <Ionicons name="location-outline" size={22} color="#fff" />
                                <StyledText className="text-white ml-3">ที่อยู่</StyledText>
                            </StyledView>
                            <StyledText className="text-neutral-500">
                                {location || "เพิ่ม"}
                            </StyledText>
                        </TouchableOpacity>

                        {/* Height & Weight */}
                        <StyledView className="flex-row space-x-2">
                            <StyledInput
                                className="flex-1 bg-neutral-800 rounded-xl px-4 py-3 text-white text-center"
                                placeholder="ส่วนสูง (ซม.)"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={height}
                                onChangeText={setHeight}
                            />
                            <StyledInput
                                className="flex-1 bg-neutral-800 rounded-xl px-4 py-3 text-white text-center"
                                placeholder="น้ำหนัก (กก.)"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                            />
                        </StyledView>
                    </StyledView>

                    {/* Additional Sections */}
                    <StyledView className="space-y-3">
                        <TouchableOpacity className="flex-row items-center justify-between bg-neutral-800 px-4 py-3 rounded-xl">
                            <StyledView className="flex-row items-center">
                                <Ionicons name="heart-outline" size={22} color="#fff" />
                                <StyledText className="text-white ml-3">ความสนใจ</StyledText>
                            </StyledView>
                            <StyledView className="flex-row items-center">
                                <StyledText className="text-neutral-500 mr-2">เพิ่ม</StyledText>
                                <Ionicons name="chevron-forward" size={22} color="#666" />
                            </StyledView>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between bg-neutral-800 px-4 py-3 rounded-xl">
                            <StyledView className="flex-row items-center">
                                <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
                                <StyledText className="text-white ml-3">คำถามชวนคุย</StyledText>
                            </StyledView>
                            <StyledView className="flex-row items-center">
                                <StyledText className="text-neutral-500 mr-2">เพิ่ม</StyledText>
                                <Ionicons name="chevron-forward" size={22} color="#666" />
                            </StyledView>
                        </TouchableOpacity>
                    </StyledView>
                </StyledView>
            </ScrollView>
        </StyledView>
    );
}