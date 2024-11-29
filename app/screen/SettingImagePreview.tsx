import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert, Image, StyleSheet, Modal, TextInput, Dimensions, Appearance, GestureResponderEvent } from "react-native";
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
import DraggableFlatList from 'react-native-draggable-flatlist';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledInput = styled(TextInput);
const StyledModal = styled(Modal);

export default function SettingImagePreview() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [cacheUserData, setCacheUserData] = useState<any>();
    const [userData, setuserData] = useState<any>();
    const [images, setImages] = useState(Array(9).fill(null));
    const [oldImages, setOldImages] = useState<string[]>([]);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const isFocus = useIsFocused();
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const albumBottomSheetRef = React.useRef<BottomSheet>(null);
    const snapPoints = ['15%'];
    const [isOpen, setIsOpen] = React.useState(false);
    const [isUpdated, setIsUpdated] = useState<boolean>(false);
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [page, setPage] = useState(1)
    const [album, setAlbum] = useState(false)

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

        const previewImages = user.data.data.profile.previewAllImageUrl;
        const updatedImages = [...previewImages];
        while (updatedImages.length < 9) {
            updatedImages.push(null);
        }
        setOldImages(updatedImages)
        setImages(updatedImages);
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
                            setImages(prevImages => [...prevImages, optimizedBase64] as string[]);
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
                    aspect: [4, 4],
                    quality: 1
                });

                if (!result.canceled) {
                    result.assets.forEach(async (image) => {
                        const optimizedBase64 = await optimizeImage(image.uri);
                        if (optimizedBase64) {
                            setImages(prevImages => [...prevImages, optimizedBase64] as string[]);
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

    const deleteImage = (index: number) => {
        const updatedImages = [...images];
        updatedImages[index] = null;
        setImages(updatedImages);
    };

    const updateImagePreview = async () => {
        try {
            setLoadingUpdate(true);
            setModalMessage('กำลังบันทึกข้อมูล...');
            const response = await axios.put(`https://friendszone.app/api/preview/${userData.id}`, {
                previewAllImages: images
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${cacheUserData?.token}`
                }
            })


            if (response.data.status !== 200) {
                setModalMessage('ไม่สามารถบันทึกข้อมูลได้');
            } else {
                setIsUpdated(false);
                setModalMessage('กำลังโหลดข้อมูลใหม่...');

                await fetchUserData();
                setModalMessage('บันทึกข้อมูลสำเร็จ');

            }


        } catch (error) {
            setModalMessage('ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setLoadingUpdate(false);
        }
    }



    interface RenderItemParams<T> {
        item: T;
        getIndex: any;
        drag: (event?: GestureResponderEvent) => void;
        isActive: boolean;
    }

    const renderItem = ({
        item,
        getIndex,
        drag,
        isActive,
    }: RenderItemParams<String>) => {
        return item !== null ? (
            <StyledView key={`Image-${getIndex}`} className={`w-4/12 h-[180px] p-1`}>
                <StyledTouchableOpacity
                    onLongPress={(event: GestureResponderEvent) => drag(event)}
                    disabled={isActive}
                    className="w-full h-full"
                >
                    <StyledImage
                        className="bg-gray-500 rounded-2xl w-full h-full"
                        source={{
                            uri: `${item.startsWith('https://') ? item : `data:image/jpeg;base64,${item}`}`,
                        }}
                    />
                </StyledTouchableOpacity>
                <StyledTouchableOpacity
                    onPress={() => deleteImage(getIndex)}
                    style={{ position: 'absolute', top: -3, right: -3, borderRadius: 50 }}
                    className="bg-red-500 dark:bg-neutral-500"
                >
                    <Ionicons name="close" size={22} color="white" />
                </StyledTouchableOpacity>
            </StyledView>
        ) : (
            <StyledView key={`Image-${getIndex}`} className={`w-4/12 h-[180px] p-1`}>
                <StyledImage className="bg-gray-500 rounded-2xl w-full h-full" />
            </StyledView>
        );
    };

    const BigImage = Dimensions.get("screen").width;
    const sizeBigImage = (BigImage / 2).toFixed(0);
    const sizeMinImage = (Number(sizeBigImage) / 2).toFixed(0);

    return (
        <>
            <StyledView className="w-full flex-1 bg-gray-50 dark:bg-neutral-900">
                <LinearGradient
                    colors={['#EB3834', '#69140F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`text-center top-0 ${Platform.OS == "ios" ? "h-[92px]" : "h-[60px]"} justify-center`}
                >
                    <StyledView className={`${Platform.OS == "ios" ? "mt-8" : ""}`}>
                        <TouchableOpacity onPress={() => navigation.navigate("SettingTab")} className=" ml-4">
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <StyledText className="absolute self-center text-lg text-white font-custom ">{page == 1 ? "แก้ไขข้อมูล" : "พรีวิว"}</StyledText>
                    </StyledView>
                </LinearGradient>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* <ScrollView> */}
                    <StyledText className="font-custom text-gray-500 mt-3 mb-1 pl-3"> รูปภาพน่าสนใจ </StyledText>
                    <StyledView className="bg-white">
                        <DraggableFlatList
                            data={images}
                            onDragEnd={({ data }) => {
                                setImages(data);
                            }}
                            keyExtractor={(item, index) => `draggable-item-${index}`}
                            renderItem={renderItem}
                            style={{
                                flex: 1
                            }}
                            containerStyle={{ flex: 1 }}

                        />
                    </StyledView>



                    {/* {
                        images.map((image, index) => (
                            image != null ? (
                                <StyledView key={`Image-${index}`} className={`w-4/12 h-[180px] p-1`}>
                                    <StyledImage className="bg-gray-500 rounded-2xl w-full h-full"
                                        source={{
                                            uri: `${image?.startsWith('https://') ? image : `data:image/jpeg;base64,${image}`}`
                                        }}
                                        onLoad={() => (
                                            <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', alignItems: "center" }} />
                                        )}
                                    >
                                    </StyledImage>

                                    <StyledTouchableOpacity
                                        onPress={() => deleteImage(index)}
                                        style={{ position: 'absolute', top: -3, right: -3, borderRadius: 50 }}
                                        className="bg-red-500 dark:bg-neutral-500"
                                    >
                                        <Ionicons name="close" size={22} color="white" />
                                    </StyledTouchableOpacity>
                                </StyledView>
                            ) : (
                                <StyledView key={`Image-${index}`} className={`w-4/12 h-[180px] p-1`}>
                                    <StyledImage className="bg-gray-500 rounded-2xl w-full h-full"
                                        onLoad={() => (
                                            <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', alignItems: "center" }} />
                                        )}
                                    >
                                    </StyledImage>
                                </StyledView>
                            )
                        ))
                    } */}

                    {/* </ScrollView> */}

                    {
                        (isUpdated) && (
                            <StyledView className="absolute bottom-5 w-full px-2 ">
                                <StyledView className="items-center flex-row w-full">
                                    <StyledView className="w-6/12 items-center">
                                        <StyledTouchableOpacity className="rounded-full bg-slate-400 w-11/12 items-center py-2"
                                            disabled={(loading || loadingUpdate)}
                                            onPress={() => setImages(oldImages)}
                                        >
                                            <StyledText className="font-custom text-white text-[20px]">
                                                คืนค่า
                                            </StyledText>
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                    <StyledView className="w-6/12 items-center">
                                        <StyledTouchableOpacity className="rounded-full bg-red-500 w-11/12 items-center py-2"
                                            disabled={(loading || loadingUpdate)}
                                            onPress={updateImagePreview}
                                        >
                                            <StyledText className="font-custom text-white text-[20px]">
                                                บันทึก
                                            </StyledText>
                                        </StyledTouchableOpacity>
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
            </StyledView >

            {isOpen && (
                <TouchableOpacity className="absolute flex-1 bg-black opacity-25 w-full h-screen justify-center"
                    onPress={() => {
                        bottomSheetRef.current?.close()
                    }}>
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

                </BottomSheetView>
            </BottomSheet>
        </>
    )
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