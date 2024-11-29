import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert, Image, Modal, TextInput, Appearance } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { NavigationProp, useIsFocused } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";;
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";

import RNPickerSelect from 'react-native-picker-select';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledInput = styled(TextInput);
const StyledBottomSheetView = styled(BottomSheetView);
const StyledBottomSheet = styled(BottomSheet);

const provinceOptions = [
    { label: 'Nakhon Ratchasima', value: 'Nakhon Ratchasima' }
];

export default function AccountSetting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [cacheUserData, setCacheUserData] = useState<any>();
    const [userData, setuserData] = useState<any>();
    const [images, setImages] = useState<string>();
    const [showImage, setShowImage] = useState<string>();
    const isFocus = useIsFocused();
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [newUsername, setNewUsername] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newProvince, setNewProvince] = useState('');
    const [newHeight, setNewHeight] = useState<number>();
    const [newWeight, setNewWeight] = useState<number>();
    const [modalMessage, setModalMessage] = useState('');

    const handlerNewUsername = (value: string) => {
        // allow A-Z, a-z, o-9 and _
        const englishRegex = /^[A-Za-z0-9_]*$/;
        if (!englishRegex.test(value)) {
            setNewUsername(value.slice(0, -1));
            return;
        } else {
            setNewUsername(value);
        }
    }

    const [theme, setTheme] = useState(Appearance.getColorScheme());
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, [])

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
        setCacheUserData(userList)

    };


    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const snapPoints = ['25%'];
    const [isOpen, setIsOpen] = React.useState(false);

    const deleteCurrentImage = async () => {

    }


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
            setShowImage(manipResult.uri);
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
                    const optimizedBase64 = await optimizeImage(result.assets[0].uri);
                    setImages(optimizedBase64);
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
                    aspect: [4, 4],
                    quality: 1
                });

                if (!result.canceled) {
                    const optimizedBase64 = await optimizeImage(result.assets[0].uri);
                    setImages(optimizedBase64);
                    setIsOpen(false);
                    bottomSheetRef.current?.close();

                }
            }
        } catch (error) {
            console.error("Error uploading image from camera: ", error);
            Alert.alert(`แจ้งเตือน`, `ไม่สามารถเข้าถึงกล้องของคุณ`, [{ text: 'OK' }]);

        }
    }

    const updateProfile = async () => {
        try {
            setModalMessage('กำลังตรวจสอบข้อมูล');
            setLoadingUpdate(true);
            if (newUsername && newUsername == userData.username) return Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้งาน', [{ text: 'OK' }]);
            setModalMessage('กำลังอัพเดทข้อมูล');
            const updateResponse = await axios.put(`https://friendszone.app/api/profile/${userData?.id}`, {
                username: newUsername ?? userData?.username,
                bio: newBio ?? userData?.bio ?? null,
                imageProfile: images,
                height: newHeight ?? userData?.height ?? 0,
                weight: newWeight ?? userData?.weight ?? 0
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${cacheUserData?.token}`
                }
            })

            if (updateResponse.data.status !== 200) return Alert.alert('แจ้งเตือน', 'ไม่สามารถอัพเดทข้อมูลได้', [{ text: 'OK' }]);
            setModalMessage('กำลังอัพเดทข้อมูลใหม่');

            const user = await axios.get(`https://friendszone.app/api/profile/${cacheUserData.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${cacheUserData?.token}`
                }
            });


            if (user.data.status !== 200) return Alert.alert('แจ้งเตือน', 'ไม่สามารถอัพเดทข้อมูลได้ในเครื่องได้ โปรดเข้าสู่ระบบใหม่อีกครั้ง', [{ text: 'OK' }]);

            const newData = user.data.data.profile;
            newData.token = cacheUserData.token;
            newData.role = cacheUserData.role;

            setModalMessage('กำลังบันทึกข้อมูลใหม่');
            await AsyncStorage.setItem('userData', JSON.stringify(newData));
            await fetchUserData();

            setModalMessage('อัพเดทข้อมูลสำเร็จ');

            //clear new data

            setNewUsername('');
            setNewBio('');
            setNewProvince('');
            setNewHeight(0);
            setNewWeight(0);
            setImages('');
            setShowImage(userData?.profileUrl);
        } catch (error) {
            console.error('Error updating profile: ', error);
            return Alert.alert('แจ้งเตือน', 'ไม่สามารถอัพเดทข้อมูลได้', [{ text: 'OK' }]);
        } finally {
            setTimeout(() => {
                setLoadingUpdate(false);
            }, 1000);
        }
    }

    return (
        <>
            <StyledView className="w-full flex-1 bg-white dark:bg-neutral-900">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`text-center top-0 ${Platform.OS == "ios" ? "h-[92px]" : "h-[60px]" } justify-center`}
                >
                    <StyledView className={`${Platform.OS == "ios" ? "mt-8" : ""}`}>
                        <TouchableOpacity onPress={() => navigation.navigate("SettingTab")} className="ml-4">
                            <StyledIonicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">ตั้งค่าบัญชี</StyledText>
                        {
                            newUsername || newBio || newProvince || newHeight || newWeight || images ? (
                                <>
                                    <TouchableOpacity onPress={() => {
                                        setNewUsername('');
                                        setNewBio('');
                                        setNewProvince('');
                                        setNewHeight(0);
                                        setNewWeight(0);
                                        setImages('');
                                        setShowImage(userData?.profileUrl);
                                    }} className="absolute right-0 mr-10">
                                        <StyledIonicons name="refresh-outline" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => updateProfile()} className="absolute right-0 mr-4">
                                        <StyledIonicons name="checkmark" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </>
                            ) : null
                        }
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
                                    <>

                                        <StyledView className="items-center justify-center w-full px-2 py-2">
                                            <StyledImage
                                                source={{ uri: showImage || userData?.profileUrl }}
                                                className="w-28 h-28 rounded-full bg-gray-600" />

                                            <StyledTouchableOpacity
                                                onPress={() => {
                                                    setIsOpen(true);
                                                    bottomSheetRef.current?.expand();
                                                }}

                                            >
                                                <StyledText className=" text-blue-500 dark:text-blue-200 underline font-custom mt-2">แก้ไขรูปภาพ</StyledText>
                                            </StyledTouchableOpacity>
                                        </StyledView>
                                        <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                                            <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">บัญชีของคุณ</StyledText>
                                        </StyledView>

                                        <StyledView className="flex-1 px-2">

                                            <StyledView className="w-full pb-3">
                                                <StyledText className=" text-gray-700 dark:text-gray-400 font-custom text-lg pl-1">ชื่อผู้ใช้</StyledText>
                                                <StyledInput
                                                    className="text-[16px] font-custom bg-gray-100 dark:bg-neutral-700 px-2 rounded-lg py-2 border-[1px] border-neutral-200 dark:border-neutral-500 dark:text-neutral-200"
                                                    value={newUsername ? newUsername : userData?.username}
                                                    onChangeText={handlerNewUsername}
                                                />
                                            </StyledView>

                                            <StyledView className="w-full pb-3">
                                                <StyledText className=" text-gray-700 dark:text-gray-400 font-custom text-lg pl-1">Bio</StyledText>
                                                <StyledInput
                                                    className="text-[16px] font-custom bg-gray-100 dark:bg-neutral-700 px-2 rounded-lg py-2 border-[1px] border-neutral-200 dark:border-neutral-500 dark:text-neutral-200 h-[100px]"
                                                    value={`${newBio ? newBio : userData?.bio}`}
                                                    onChangeText={setNewBio}
                                                    multiline={true}
                                                    maxLength={256}

                                                />
                                            </StyledView>
                                        </StyledView>

                                        <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                                            <StyledText className=" text-gray-500 dark:text-gray-200 font-custom">ข้อมูลที่แสดง</StyledText>
                                        </StyledView>
                                        <StyledView className="flex-row justify-center flex-1 px-3 gap-1">
                                            <StyledView className="w-6/12 pb-3">
                                                <StyledText className=" text-gray-700 dark:text-gray-400 font-custom text-lg pl-1">ส่วนสูง</StyledText>
                                                <StyledInput
                                                    className="text-[16px] font-custom bg-gray-100 dark:bg-neutral-700 px-2 rounded-lg py-2 border-[1px] border-neutral-200 dark:border-neutral-500 dark:text-neutral-200"
                                                    value={newHeight ? newHeight : userData?.height}
                                                    onChangeText={(number) => setNewHeight(parseInt(number ?? 0))}
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    maxLength={3}

                                                />
                                            </StyledView>

                                            <StyledView className="w-6/12 pb-3">
                                                <StyledText className=" text-gray-700 dark:text-gray-400 font-custom text-lg pl-1">น้ำหนัก</StyledText>
                                                <StyledInput
                                                    className="text-[16px] font-custom bg-gray-100 dark:bg-neutral-700 px-2 rounded-lg py-2 border-[1px] border-neutral-200 dark:border-neutral-500 dark:text-neutral-200"
                                                    value={newWeight ? newWeight : userData?.weight}
                                                    onChangeText={(number) => setNewWeight(parseInt(number ?? 0))}
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    maxLength={3}
                                                />
                                            </StyledView>
                                        </StyledView>
                                    </>
                                )
                        }

                    </ScrollView>

                </KeyboardAvoidingView >
            </StyledView>
            {isOpen && (
                <TouchableOpacity className="absolute flex-1 bg-black opacity-25 w-full h-screen justify-center"
                    onPress={() => bottomSheetRef.current?.close()}>
                </TouchableOpacity>
            )}

            <StyledBottomSheet
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
                <StyledBottomSheetView className="px-[10px">
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
                        <TouchableOpacity onPress={() => deleteCurrentImage()} className="flex-row items-center">
                            <StyledIonicons
                                name="trash-bin-outline"
                                size={24}
                                color="#ef4444"
                            />
                            <StyledText className="pl-2 text-red-500 text-lg font-custom">ลบรูปภาพปัจจุบันออก</StyledText>
                        </TouchableOpacity>
                    </StyledView>

                </StyledBottomSheetView>
            </StyledBottomSheet>
            <Modal visible={loadingUpdate} transparent={true} animationType="fade">
                <StyledView className="flex-1 bg-black opacity-50 w-full h-screen">

                </StyledView>

                <StyledView className="absolute flex-1 justify-center items-center w-full h-screen rou">
                    <StyledView className="w-[300px] p-[20px] bg-white dark:bg-neutral-700 rounded-2xl items-center">
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom text-[16px] dark:text-neutral-200">{modalMessage}</StyledText>
                    </StyledView>
                </StyledView>
            </Modal>
        </>
    );
}