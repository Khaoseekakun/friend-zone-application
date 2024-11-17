import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert, Image, StyleSheet, Modal, TextInput } from "react-native";
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

import RNPickerSelect from 'react-native-picker-select';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledInput = styled(TextInput);

const provinceOptions = [
    { label: 'Nakhon Ratchasima', value: 'Nakhon Ratchasima' }
];

export default function AccountSetting() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [userData, setuserData] = useState<any>();
    const [images, setImages] = useState<string>();
    const isFocus = useIsFocused();

    const [newUsername, setNewUsername] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newProvince, setNewProvince] = useState('');


    useEffect(() => {

        try {
            fetchUserData();
        } finally {
            setLoading(false);
        }

        if (isFocus) {
            fetchUserData();
        }


    }, [isFocus]);

    const fetchUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        const userList = JSON.parse(userData as string) || {}
        const user = await axios.get(`https://friendszone.app/api/profile/${userList.id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `All ${JSON.parse(userData as any).token as string}`
            }
        });

        if (user.data.status !== 200) return null;
        setuserData(user.data.data.profile);

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
                [{ resize: { width: 800 } }],
                {
                    compress: 0.7,
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );
            return manipResult.uri;
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
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 4],
                    quality: 1,
                });

                if (!result.canceled) {
                    const optimizedUri = await optimizeImage(result.assets[0].uri);
                    setImages(optimizedUri);
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
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 4],
                    quality: 1
                });

                if (!result.canceled) {
                    const optimizedUri = await optimizeImage(result.assets[0].uri);
                    setImages(optimizedUri);
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
            const updateResponse = await axios.put(`https://friendszone.app/api/profile/${userData?.id}`, {
                username: newUsername,
                bio: newBio,
                imageProfile : images
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${JSON.parse(userData as any).token as string}`
                }
            })
        } catch (error) {

        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="w-full flex-1 bg-white">
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
                        <StyledText className="absolute self-center text-lg text-white font-custom ">ตั้งค่าบัญชี</StyledText>
                    </StyledView>
                </LinearGradient>
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
                                            source={{ uri: images || userData?.profileUrl }}
                                            className="w-28 h-28 rounded-full bg-gray-600" />

                                        <StyledTouchableOpacity
                                            onPress={() => {
                                                setIsOpen(true);
                                                bottomSheetRef.current?.expand();
                                            }}

                                        >
                                            <StyledText className=" text-blue-500 font-custom mt-2">แก้ไขรูปภาพ</StyledText>
                                        </StyledTouchableOpacity>


                                    </StyledView>



                                    <StyledView className="flex-row items-center justify-between w-full px-3 py-2">
                                        <StyledText className=" text-gray-500 font-custom">บัญชีของคุณ</StyledText>
                                    </StyledView>

                                    <StyledView className="flex-1 px-2">
                                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                                            <StyledView className="w-4/12">
                                                <StyledText className=" text-gray-700 font-custom">ชื่อ</StyledText>
                                            </StyledView>
                                            <StyledView className="w-8/12 border-b-[1px] border-gray-200">
                                                <StyledInput
                                                    value={`${userData?.username}`}
                                                />
                                            </StyledView>
                                        </StyledView>

                                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                                            <StyledView className="w-4/12">
                                                <StyledText className=" text-gray-700 font-custom">Bio</StyledText>
                                            </StyledView>
                                            <StyledView className="w-8/12 border-b-[1px] border-gray-200">
                                                <StyledInput
                                                    value={`${userData?.bio ?? ''}`}
                                                />
                                            </StyledView>
                                        </StyledView>

                                        <StyledView className="flex-row items-center justify-between w-full px-3 pb-3">
                                            <StyledView className="w-4/12">
                                                <StyledText className=" text-gray-700 font-custom">จังหวัด</StyledText>
                                            </StyledView>
                                            <StyledView className="w-8/12 border-b-[1px] border-gray-200">
                                                <RNPickerSelect
                                                    disabled={true}
                                                    onValueChange={setNewProvince}
                                                    items={provinceOptions}
                                                    value={newProvince ? newProvince : userData?.province[0]}
                                                    placeholder={{ label: 'เลือกจังหวัด', value: null }}
                                                    style={{
                                                        inputIOS: {
                                                            fontFamily: 'Kanit',
                                                            width: '100%',
                                                        },
                                                        inputAndroid: {
                                                            fontFamily: 'Kanit',
                                                            width: '100%',
                                                        },

                                                    }
                                                    }

                                                />
                                            </StyledView>
                                        </StyledView>
                                    </StyledView>
                                </>
                            )
                    }

                </ScrollView>
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

            >
                <BottomSheetView style={{
                    paddingLeft: 10,
                    paddingRight: 10,
                }}>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity onPress={() => uploadImageFromGallery()} className="flex-row items-center">
                            <Ionicons
                                name="image-outline"
                                size={24}
                                color="black"
                            />
                            <StyledText className="pl-2 text-lg font-custom">เลือกจากคลัง</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity onPress={() => uploadImageFromCamera()} className="flex-row items-center">
                            <Ionicons
                                name="camera-outline"
                                size={24}
                                color="black"
                            />
                            <StyledText className="pl-2 text-lg font-custom">ถ่ายภาพ</StyledText>
                        </TouchableOpacity>
                    </StyledView>
                    <StyledView className="my-1 px-3 py-1">
                        <TouchableOpacity onPress={() => deleteCurrentImage()} className="flex-row items-center">
                            <Ionicons
                                name="trash-bin-outline"
                                size={24}
                                color="#ef4444"
                            />
                            <StyledText className="pl-2 text-red-500 text-lg font-custom">ลบรูปภาพปัจจุบันออก</StyledText>
                        </TouchableOpacity>
                    </StyledView>

                </BottomSheetView>
            </BottomSheet>
        </KeyboardAvoidingView >
    );
}


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 200,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    }
});
