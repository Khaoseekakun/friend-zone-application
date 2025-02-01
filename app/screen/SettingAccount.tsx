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
import { JobsList } from "@/types/prismaInterface";
import FireBaseApp from "@/utils/firebaseConfig";
import { getStorage, uploadBytes, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as Location from 'expo-location';


const database = getStorage(FireBaseApp);

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
    height: number;
    weight: number;
    profileUrl: string;
    jobCategory: {
        JobsList: JobsList[]
    },
    JobMembers: {
        jobId: string;
        jobName: string;
    }[],
    previewAllImageUrl: string[];
    previewFirstImageUrl?: string;
    previewVideoUrl?: string;
    type: string;
    longitude: number;
    latitude: number;
    otherService: boolean;
    otherServiceDetail: string;
}

interface ServiceOption {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const GRADIENT_START = '#ec4899';
const GRADIENT_END = '#f97316';

export default function AccountSetting() {
    const navigation = useNavigation<any>();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [jobsList, setJobsList] = useState([]);

    // Image States
    const [oldImages, setOldImages] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Video States
    const [oldVideo, setOldVideo] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTimer, setUploadTimer] = useState<NodeJS.Timeout | null>(null);

    // UI States
    const [isUpdated, setIsUpdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [isVideoUpdated, setIsVideoUpdated] = useState(false);
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);


    const [userToken, setuUerToken] = useState<any>(null);

    const [otherService, setOtherService] = useState<string | null>(null);

    useEffect(() => {
        (() => {
            AsyncStorage.getItem('userToken').then((value) => {
                if (value) {
                    setuUerToken(value);
                }
            })
        })()
    }, [])


    const UploadingVideo = async () => {
        try {
            setUploading(true);
            setUploadProgress(0);
            if (!video) return Alert.alert('ข้อผิดพลาด', 'ไม่พบวิดีโอที่จะอัพโหลด');
            const response = await fetch(video);
            const blob = await response.blob();
            const extension = video.split('.').pop();
            const refVideo = ref(database, `/video/${profileData?.id}.${extension}`);
            const uploadTask = uploadBytesResumable(refVideo, blob);

            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            });

            await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(refVideo);

                        await axios.put(`https://friendszone.app/api/member/${profileData?.id}/video`, {
                            downloadUrl: downloadURL
                        }, {
                            headers: {
                                'Authorization': `Member ${userToken}`,
                                'Content-Type': 'application/json',
                            }
                        })

                        setProfileData(profileData => profileData ? ({
                            ...profileData,
                            previewVideoUrl: downloadURL
                        }) : null)

                        setOldVideo(downloadURL);
                        setVideo(downloadURL);
                        setIsVideoUpdated(false);
                        resolve(uploadTask.snapshot);
                    }
                );
            });

        } catch (error) {
            console.error('Error uploading video:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัพโหลดวิดีโอได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
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
                mediaTypes: 'videos',
                allowsEditing: true,
                aspect: [9, 12],
                quality: 1,
                videoMaxDuration: 60,
            });

            if (!result.canceled) {
                const response = await fetch(result.assets[0].uri);
                const blob = await response.blob();
                const fileSize = blob.size / (1024 * 1024);
                setVideo(result.assets[0].uri);

                if (fileSize > 50) {
                    Alert.alert('ข้อผิดพลาด', 'ขนาดไฟล์วิดีโอต้องไม่เกิน 100MB');
                    return;
                }
            }
        } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกวิดีโอได้ กรุณาลองใหม่อีกครั้ง');
            setUploading(false);
            setUploadProgress(0);
            setUploadTimer(null);
        }
    };

    useEffect(() => {
        // check video changes
        if (video !== oldVideo) {
            setIsVideoUpdated(true);
        } else {
            setIsVideoUpdated(false);
        }
    }, [video]);


    useEffect(() => {
        if (profileData?.type === "member") {
            const hasChanges =
                JSON.stringify(images) !== JSON.stringify(oldImages) ||
                JSON.stringify(selectedServices) !== JSON.stringify(profileData?.JobMembers?.map((service) => service.jobId)) ||
                bio !== profileData?.bio ||
                latitude !== profileData?.latitude ||
                longitude !== profileData?.longitude ||
                height !== profileData?.height?.toString() ||
                weight !== profileData?.weight?.toString() ||
                username !== profileData?.username ||
                profileImage !== profileData?.profileUrl ||
                otherService !== profileData?.otherServiceDetail

            setIsUpdated(hasChanges);
        } else {
            const hasChanges =
                JSON.stringify(images) !== JSON.stringify(oldImages) ||
                bio !== profileData?.bio ||
                latitude !== profileData?.latitude ||
                longitude !== profileData?.longitude ||
                height !== profileData?.height?.toString() ||
                weight !== profileData?.weight?.toString() ||
                username !== profileData?.username ||
                profileImage !== profileData?.profileUrl

            setIsUpdated(hasChanges);
        }
    }, [images, selectedServices, bio, education, longitude, latitude, height, weight, profileData, profileImage, username, otherService]);

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            const response = await axios.get<{ status: number; data: { profile: any } }>(
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
                setHeight(profile.height?.toString() || "");
                setWeight(profile.weight?.toString() || "");
                setImages(profile.previewAllImageUrl || []);
                setOldImages(profile.previewAllImageUrl || []);
                setLatitude(profile.latitude);
                setLongitude(profile.longitude);
                setOldVideo(profile.previewVideoUrl || null);
                setProfileImage(profile.profileUrl || null);


                if (profile.type === "member") {
                    setVideo(profile?.previewVideoUrl || null);
                    if (profile.otherService) {
                        setSelectedServices(profileData?.JobMembers.map((service) => service.jobId) || []);
                        setOtherService(profile.otherServiceDetail);
                        
                    }else{
                        setSelectedServices(profileData?.JobMembers.map((service) => service.jobId) || []);
                    }
                    setJobsList(profile?.jobCategory?.JobsList || [])
                    if (profile.JobMembers.length > 0) {
                        for (let i = 0; i < profile.JobMembers.length; i++) {
                            toggleService(profile.JobMembers[i].jobId)
                        }
                    }
                }
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

    const handleImagePickProfile = async (useCamera = false) => {
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
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [9, 9],
                    quality: 1
                });

            if (!result.canceled && result.assets[0]) {
                const optimizedBase64 = await optimizeImage(result.assets[0].uri);
                if (optimizedBase64) {
                    setProfileImage(optimizedBase64);
                }else{
                    alert('เกิดข้อผิดพลาดในการเลือกรูปภาพ');
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('เกิดข้อผิดพลาดในการเลือกรูปภาพ');
        }
    };

    const getCurrentLocation = async () => {
        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
    }

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
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [3,6],
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

        if (serviceId === 'other_service') {
            if (selectedServices.includes('other_service')) {
                setSelectedServices(prev => prev.filter(id => id !== 'other_service'));
                setOtherService(null);
                return;
            }
            setSelectedServices(prev => [...prev, 'other_service']);
            return;
        } else {
            setSelectedServices(prev =>
                prev.includes(serviceId)
                    ? prev.filter(id => id !== serviceId)
                    : [...prev, serviceId]
            );
        }
    };

    const saveProfile = async () => {
        try {
            setLoadingUpdate(true);
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const userList = JSON.parse(userData);
            const res = await axios.put(
                `https://friendszone.app/api/profile/${userList.id}`,
                {
                    bio,
                    education,
                    longitude: Number(longitude),
                    latitude: Number(latitude),
                    height: Number(height),
                    weight: Number(weight),
                    images,
                    services: selectedServices,
                    imageProfile: profileImage,
                    otherService
                },
                {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                }
            );

            if (res.status === 200) {

                try {
                    const newData = res.data.data.newData as UserProfile;
                    if(newData.profileUrl){
                        const userData = await AsyncStorage.getItem('userData');
                        if (userData) {
                            const user = JSON.parse(userData);
                            user.profileUrl = newData.profileUrl;
                            await AsyncStorage.setItem('userData', JSON.stringify(user));
                        }
                    }
                } catch (error) {
                    console.log('Error updating profile image:', error);
                }



                if (images != oldImages) {
                    await axios.put(`https://friendszone.app/api/preview/${userList.id}`, {
                        previewAllImages: images,
                    }, {
                        headers: {
                            "Authorization": `All ${userList?.token}`
                        }
                    })
                }

                setIsUpdated(false);
                setOldImages(images);
                await fetchUserData();
            } else {
                Alert.alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }



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
            setHeight(profileData.height?.toString() || "");
            setWeight(profileData.weight?.toString() || "");
            setSelectedServices(profileData?.JobMembers?.map((service) => service.jobId));
            setImages(profileData.previewAllImageUrl || []);
            setOldImages(profileData.previewAllImageUrl || []);
            setProfileImage(profileData.profileUrl || null);
            setVideo(profileData.previewVideoUrl || null);
            setUsername(profileData.username || "");
            setIsUpdated(false);
            setLatitude(profileData.latitude || 0);
            setLongitude(profileData.longitude || 0);

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
            </StyledView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <StyledView className="px-4 py-4 space-y-6 mb-16">
                    <StyledView className="self-center ">
                        <TouchableOpacity
                            onPress={() => handleImagePickProfile(false)}
                            className=""
                        >
                            {profileImage ? (
                                <StyledImage
                                    source={{ uri: profileImage.includes("http") ? profileImage : `data:image/jpeg;base64,${profileImage}` }}
                                    className="w-24 h-24 rounded-full"
                                />
                            ) : (
                                profileData?.profileUrl ? (
                                    <StyledImage
                                        source={{ uri: profileData.profileUrl }}
                                        className="w-24 h-24 rounded-full"
                                    />
                                ) : (
                                    <StyledView className="w-[100px] h-[100px] rounded-full bg-gray-200 dark:bg-neutral-800 border-[1px] border-neutral-300 dark:border-neutral-700 border-dashed items-center justify-center">
                                        <StyledIonicons
                                            name={
                                                'camera-outline'
                                            }
                                            size={40}
                                            className="text-gray-500">
                                        </StyledIonicons>
                                    </StyledView>
                                )
                            )}

                            <StyledText className="mt-2 font-custom text-gray-600">อัพโหลดรูปภาพ</StyledText>
                        </TouchableOpacity>
                    </StyledView >
                    <StyledView className="border-b-[1px] border-gray-200"></StyledView>
                    <StyledView>
                        <StyledText className="font-custom text-neutral-400 text-base mb-2">
                            รูปภาพน่าสนใจ
                        </StyledText>
                        <StyledView className="flex-row flex-wrap">
                            {images?.map((image, index) => (
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
                    {
                        profileData?.type === "member" && (
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
                                            {
                                                isVideoUpdated ? (
                                                    <StyledView className="absolute -top-2 -right-2 z-10">
                                                        <StyledTouchableOpacity
                                                            onPress={() => {
                                                                // reset stored video
                                                                setVideo(profileData?.previewVideoUrl || null);
                                                            }}
                                                            className="bg-red-500 rounded-full p-1.5"
                                                        >
                                                            <StyledIonicons name="reload" size={18} className="text-white" />
                                                        </StyledTouchableOpacity>
                                                        {video !== profileData.previewVideoUrl && (
                                                            <StyledTouchableOpacity
                                                                onPress={() => UploadingVideo()}
                                                                className="bg-blue-500 rounded-full p-1.5"
                                                            >
                                                                <StyledIonicons name="save-outline" size={18} className="text-white" />
                                                            </StyledTouchableOpacity>
                                                        )}


                                                    </StyledView>
                                                ) : (
                                                    <StyledTouchableOpacity
                                                        onPress={() => setVideo(null)}
                                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 z-10"
                                                    >
                                                        <StyledIonicons name="close" size={18} className="text-white" />
                                                    </StyledTouchableOpacity>
                                                )
                                            }

                                        </StyledView>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={handleVideoPick}
                                            className="w-full h-full"
                                        >
                                            <StyledView className="flex-1 rounded-xl bg-white dark:bg-neutral-800 items-center justify-center border border-neutral-300 dark:border-neutral-700 border-dashed">

                                                <StyledIonicons name="videocam-outline" size={40} className="text-black dark:text-white mb-2" />
                                                <StyledText className="font-custom text-neutral-500 dark:text-neutral-400">
                                                    อัพโหลดวิดีโอ (ขนาดไม่เกิน 50 MB, ความยาวไม่เกิน 1 นาที)
                                                </StyledText>
                                                {isVideoUpdated && (
                                                    <StyledTouchableOpacity
                                                        onPress={() => {
                                                            // reset stored video
                                                            setVideo(profileData?.previewVideoUrl || null);
                                                        }}
                                                        className="bg-red-500 rounded-full p-1.5 absolute -top-2 -right-2"
                                                    >
                                                        <StyledIonicons name="reload" size={18} className="text-white" />
                                                    </StyledTouchableOpacity>
                                                )}
                                            </StyledView>
                                        </TouchableOpacity>
                                    )}
                                </StyledView>
                            </StyledView>
                        )
                    }

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

                            <TouchableOpacity

                                onPress={(() => {
                                    getCurrentLocation()
                                })}



                                className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden">
                                <StyledView className="flex-row items-center p-3 border-l-4 border-pink-500">
                                    <StyledView className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full items-center justify-center">
                                        <StyledIonicons
                                            name="location-outline"
                                            size={32}
                                            className="text-pink-500"
                                        />
                                    </StyledView>

                                    <StyledView className="flex-1 ml-3">
                                        {
                                            (longitude != 0 && latitude != 0) && (
                                                <StyledText
                                                    className="dark:text-white font-custom text-base"
                                                >พิกัด : {latitude?.toFixed(5)}... , {longitude?.toFixed(5)}...</StyledText>
                                            )
                                        }
                                        <StyledText
                                            className="text-gray-500 dark:text-white font-custom text-base "
                                        >คลิกที่นี่เพิ่มตั้งค่าที่อยู่ของคุณตาม GPS</StyledText>
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

                    {
                        // check user type 
                        profileData?.type === "member" && (
                            <StyledView>
                                <StyledText className="font-custom text-neutral-400 text-base mb-3">
                                    บริการของฉัน
                                </StyledText>
                                <StyledView className="flex-row flex-wrap gap-2">
                                    {jobsList?.map((service: JobsList) => (
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
                                            <StyledText className={` ${selectedServices.includes(service.id)
                                                ? 'text-white'
                                                : 'text-neutral-600 dark:text-white'
                                                } font-custom`}>
                                                {service.jobName}
                                            </StyledText>
                                        </TouchableOpacity>
                                    ))}


                                    <TouchableOpacity
                                        key={'other_service'}
                                        onPress={() => toggleService('other_service')}
                                        className={`flex-row items-center rounded-full px-4 py-2 border ${selectedServices.includes('other_service')
                                            ? 'border-transparent'
                                            : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                                            }`}
                                        style={selectedServices.includes('other_service') ? {
                                            backgroundColor: GRADIENT_START,
                                            borderWidth: 0,
                                        } : {}}
                                    >
                                        <StyledText className={` ${selectedServices.includes('other_service')
                                            ? 'text-white'
                                            : 'text-neutral-600 dark:text-white'
                                            } font-custom`}>
                                            {"บริการอื่นๆ"}
                                        </StyledText>
                                    </TouchableOpacity>

                                </StyledView>

                                {
                                    selectedServices.includes('other_service') && (
                                        <StyledInput
                                            className="bg-white dark:bg-neutral-800 rounded-xl p-4 dark:text-white font-custom mt-2"
                                            placeholder="โปรดระบุ"
                                            placeholderTextColor="#666"
                                            value={otherService ?? ''}
                                            onChangeText={setOtherService}
                                            maxLength={50}
                                        />
                                    )
                                }
                            </StyledView>
                        )
                    }

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
            {
                uploading && (
                    <StyledView className="absolute top-0 left-0 w-full h-full bg-black/20 items-center justify-center">
                        <StyledView className="bg-white dark:bg-neutral-950 p-4 rounded-xl shadow-lg">
                            <StyledText className="font-custom text-black dark:text-white text-lg text-center mb-4">
                                กำลังอัพโหลด
                            </StyledText>
                            <ActivityIndicator size="large" color="#999" />
                            <StyledText className="font-custom text-lg text-black dark:text-white text-center mt-4">
                                {uploadProgress.toFixed(1)}%
                            </StyledText>
                            <StyledView className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2.5 mt-2">
                                <StyledView
                                    className="bg-blue-500 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </StyledView>
                        </StyledView>
                    </StyledView>
                )
            }
        </StyledKeyboardAvoidingView>
    );
}