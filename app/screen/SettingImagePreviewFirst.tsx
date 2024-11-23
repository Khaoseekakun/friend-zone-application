import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert, Image, StyleSheet, Modal, TextInput, Dimensions, Appearance } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, StackActions, useIsFocused } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";;
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import HeartIcon from "@/components/svg/heart";
import { getAge } from "@/utils/Date";


const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledInput = styled(TextInput);


export default function SettingImagePreviewFirst() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [cacheUserData, setCacheUserData] = useState<any>();
    const [userData, setuserData] = useState<any>();
    const [images, setImages] = useState<string>();
    const [oldImages, setOldImages] = useState<string>();
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const isFocus = useIsFocused();
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const snapPoints = ['25%'];
    const [isOpen, setIsOpen] = React.useState(false);
    const [isUpdated, setIsUpdated] = useState<boolean>(false);
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, [])
    useEffect(() => {
        if (JSON.stringify(images) !== JSON.stringify(oldImages)) {
            setIsUpdated(true);
            console.log("Updated");
        } else {
            setIsUpdated(false);
        }
    }, [images, oldImages]);

    useEffect(() => {
        try {
            fetchUserData();
        } finally {
            if (userData) {
                setLoading(false);
            }
        }

        if (isFocus) {
            setLoading(true);
            try {
                fetchUserData();
            } finally {
                setLoading(false);
            }
        }
    }, [isFocus]);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        const userList = JSON.parse(userData as string) || {}
        const user = await axios.get(`https://friendszone.app/api/profile/${userList.id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `All ${userList?.token}`
            }
        });

        if (user.data.status !== 200) return null;
        setuserData(user.data.data.profile);
        setOldImages(user.data.data.profile.previewFirstImageUrl);
        setImages(user.data.data.profile.previewFirstImageUrl);
        setCacheUserData(userList)

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

    const uploadImageFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(`แจ้งเตือน`, `คุณต้องให้สิทธิ์ให้แอปเข้าถึงคลังภาพของคุณ`, [{ text: 'OK' }]);
                return;
            } else {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [4, 4],
                    quality: 1
                });

                if (!result.canceled) {

                    result.assets.forEach(async (image) => {
                        const optimizedBase64 = await optimizeImage(image.uri);
                        if (optimizedBase64) {
                            setImages(optimizedBase64);
                        }
                    })

                    setIsOpen(false);
                    bottomSheetRef.current?.close();
                }
            }
        } catch (error) {
            console.error("Error uploading image from gallery: ", error);
            Alert.alert(`แจ้งเตือน`, `ไม่สามารถเข้าถึงคลังภาพของคุณ`, [{ text: 'OK' }]);
        }
    }

    const uploadImageFromCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(`แจ้งเตือน`, `คุณต้องให้สิทธิ์ให้แอปเข้าถึงกล้องของคุณ`, [{ text: 'OK' }]);
                return;
            } else {
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [4, 6],
                    quality: 1
                });

                if (!result.canceled) {
                    result.assets.forEach(async (image) => {
                        const optimizedBase64 = await optimizeImage(image.uri);
                        if (optimizedBase64) {
                            setImages(optimizedBase64);
                        }
                    })

                    setIsOpen(false);
                    bottomSheetRef.current?.close();
                }
            }
        } catch (error) {
            console.error("Error uploading image from camera: ", error);
            Alert.alert(`แจ้งเตือน`, `ไม่สามารถเข้าถึงกล้องของคุณ`, [{ text: 'OK' }]);

        }
    }

    const deleteImage = () => {
        setImages('');
    }

    const updateImagePreview = async () => {
        try {
            setLoadingUpdate(true);
            setModalMessage('กำลังบันทึกข้อมูล...');
            const response = await axios.put(`https://friendszone.app/api/preview/${userData?.id}`, {
                previewFirstImage: images
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${cacheUserData?.token}`
                }
            })


            if (response.data.status !== 200) {
                return Alert.alert(`แจ้งเตือน`, `ไม่สามารถบันทึกข้อมูลได้`, [{ text: 'OK' }]);
            } else {
                setOldImages(images);
                setIsUpdated(false);

                return Alert.alert(`แจ้งเตือน`, `บันทึกข้อมูลสำเร็จ`, [{ text: 'OK' }]);
            }


        } catch (error) {
            console.log(error)
            return Alert.alert(`แจ้งเตือน`, `ไม่สามารถบันทึกข้อมูลได้`, [{ text: 'OK' }]);
        } finally {
            setLoadingUpdate(false);
        }
    }

    return (
        <>
            <StyledView className="w-full flex-1 bg-white dark:bg-neutral-900">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="text-center top-0 h-[92px] justify-center"
                >
                    <StyledView className="mt-5">
                        <TouchableOpacity onPress={() => navigation.navigate("SettingTab")} className="absolute ml-4">
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">ตั้งค่ารูปภาพตัวอย่าง</StyledText>
                    </StyledView>
                </LinearGradient>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView>

                        {
                            loading ? <ActivityIndicator size="large" color="#EB3834" style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                top: "100%"
                            }} /> :
                                (
                                    <StyledView className="flex-1 px-3 pt-2">
                                        <StyledView key={`Image`} className={`w-12/12 h-[550px] p-1`}>
                                            <StyledImage className="bg-gray-500 rounded-2xl w-full h-full"
                                                source={{
                                                    uri: `${images && images.startsWith('https://') ? images : `data:image/jpeg;base64,${images}`}`
                                                }}
                                                onLoad={() => (
                                                    <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', alignItems: "center" }} />
                                                )}
                                            >

                                            </StyledImage>
                                            <StyledView className="absolute bottom-3 px-4">
                                                <StyledView className="flex-row items-center">
                                                    <StyledText className="font-custom text-white text-3xl">{userData?.username}</StyledText>
                                                    <StyledText className="font-custom text-white text-3xl mx-1">{getAge(userData?.birthday as unknown as string)}</StyledText>
                                                    <StyledIonicons
                                                        name={userData?.gender === "ชาย" ? "male" : "female"}
                                                        color={userData?.gender === "ชาย" ? '#69ddff' : '#ff8df6'}
                                                        size={33}
                                                    />
                                                </StyledView>
                                                <StyledView className="flex-row items-center mt-1">
                                                    <HeartIcon />
                                                    <StyledText className="font-custom text-white text-2xl ml-1">
                                                        {userData?.rating.toFixed(1)}
                                                    </StyledText>

                                                    <StyledText className="font-custom text-gray-300 text-xl ml-1">
                                                        ({userData?.reviews.toLocaleString()})
                                                    </StyledText>
                                                </StyledView>
                                            </StyledView>

                                        </StyledView>

                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsOpen(true)
                                                bottomSheetRef.current?.expand()
                                            }}>
                                            <StyledView className="flex-row absolute -bottom-16 bg-red-500 w-full rounded-full px-3 py-2 justify-center">

                                                <StyledText className="font-custom text-white text-lg text-center">เปลี่ยนรูปภาพ</StyledText>
                                            </StyledView>
                                        </TouchableOpacity>
                                    </StyledView>
                                )
                        }

                    </ScrollView>

                    {
                        (isUpdated) && (
                            <StyledView className="absolute bottom-5 w-full px-2 ">
                                <StyledView className="items-center flex-row w-full">
                                    <StyledView className="w-6/12 items-center">
                                        <StyledTouchableOpacity className="rounded-full bg-slate-400 w-11/12 items-center py-2"
                                            disabled={(loading || loadingUpdate)}
                                            onPress={() => setImages(oldImages)}
                                        >
                                            {
                                                loadingUpdate ? <ActivityIndicator size={25} color="#fff" /> :
                                                    <StyledText className="font-custom text-white text-[20px]">
                                                        คืนค่า
                                                    </StyledText>
                                            }
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                    <StyledView className="w-6/12 items-center">
                                        <TouchableOpacity className="rounded-full bg-red-500 w-11/12 items-center py-2"
                                            disabled={(loading || loadingUpdate)}
                                            onPress={updateImagePreview}
                                        >
                                            {
                                                loadingUpdate ? <ActivityIndicator size={25} color="#fff" /> :
                                                    <StyledText className="font-custom text-white text-[20px]">
                                                        บันทึก
                                                    </StyledText>
                                            }
                                        </TouchableOpacity>
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        )
                    }

                </KeyboardAvoidingView >
                <Modal visible={loadingUpdate} transparent={true} animationType="fade">
                    <StyledView className="flex-1 bg-black opacity-50 w-full h-screen">

                    </StyledView>

                    <StyledView className="absolute flex-1 justify-center items-center w-full h-screen ">
                        <StyledView className="w-[300px] p-[20px] bg-white rounded-2xl items-center">
                            <ActivityIndicator size="large" color="#EB3834" />
                            <StyledText className="font-custom text-[16px]">{modalMessage}</StyledText>
                        </StyledView>
                    </StyledView>
                </Modal>
            </StyledView>
            {isOpen && (
                <TouchableOpacity className="absolute flex-1 bg-black opacity-25 w-full h-screen justify-center"
                    onPress={() => bottomSheetRef.current?.close()}>
                </TouchableOpacity>
            )}
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onClose={() => setIsOpen(false)}
                index={-1}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#404040" : "#fff"
                }}

            >
                <BottomSheetView style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                }}>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity onPress={() => uploadImageFromGallery()} className="flex-row items-center">
                            <StyledIonicons
                                name="image-outline"
                                size={24}
                                className="text-black dark:text-neutral-200"
                            />
                            <StyledText className="pl-2 text-lg font-custom text-black dark:text-neutral-200">เลือกจากคลัง</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity onPress={() => uploadImageFromCamera()} className="flex-row items-center">
                            <StyledIonicons
                                name="camera-outline"
                                size={24}
                                className="text-black dark:text-neutral-200 "
                            />
                            <StyledText className="pl-2 text-lg font-custom text-black dark:text-neutral-200">ถ่ายภาพ</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity
                            disabled={!images}
                            onPress={() => deleteImage()} className="flex-row items-center">
                            <Ionicons
                                name="trash-outline"
                                size={24}
                                color={images ? "#ef4444" : "#fca5a5"}
                            />

                            <StyledText className={`pl-2 text-lg font-custom ${images ? 'text-red-500' : 'text-red-300'}`}>ลบรูปภาพ</StyledText>
                        </TouchableOpacity>
                    </StyledView>

                </BottomSheetView>
            </BottomSheet>
        </>
    )
}
