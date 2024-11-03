import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { initializeApp } from "firebase/app";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Logout } from "@/utils/Auth/Logout";
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledBottomSheetView = styled(BottomSheetView);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
const firebaseConfig = {
    apiKey: "AIzaSyB6-tcwtkosfRGDQq4_6Nvpz47Lnt33_UM",
    authDomain: "friendszone-d1e20.firebaseapp.com",
    projectId: "friendszone-d1e20",
    storageBucket: "friendszone-d1e20.appspot.com",
    messagingSenderId: "820285031495",
    appId: "1:820285031495:web:154296ce35bf7171bcdd62",
    measurementId: "G-RN2B2NF5DM"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default function Post() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [message, setMessage] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const selectcount = 6;
    const [loading, setLoading] = useState(false);
    const messageLimit = 512;
    const [textFocus, setTextFocus] = useState(false);

    const snapPoints = useMemo(() => ["25%"], ["50%"]);

    const [userData, setuserData] = useState<any>();
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData as string) || {});
        };

        fetchUserData();

    }, []);

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

    const pickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 1,
            selectionLimit: images.length < selectcount ? selectcount - images.length : 0,
            allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(async (asset) => {
                // Compress and resize the image
                const optimizedUri = await optimizeImage(asset.uri);
                return optimizedUri;
            });

            const optimizedImageUris = await Promise.all(newImages);

            setImages(prevImages => {
                const allImages = new Set([...prevImages, ...optimizedImageUris]);
                return Array.from(allImages);
            });
        }
    };

    const deleteImage = (uri: string) => {
        setImages(images.filter(image => image !== uri));
    };

    const uploadImages = async (postId: string) => {
        if (!postId) return Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        const imageUrls: string[] = [];
        for (const uri of images) {
            const response = await fetch(uri);
            const blob = await response.blob();
            const imageRef = ref(storage, `post_images/${Date.now()}.jpg`);

            try {
                await uploadBytes(imageRef, blob);
                const imageUrl = await getDownloadURL(imageRef);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error("Error uploading image: ", error);
            }
        }

        PostUpdate(postId, imageUrls);
    };

    const PostUpdate = async (postId: string, imageUrls: string[]) => {
        if (!postId) return Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        try {
            const putData = await axios.put(`https://friendszone.app/api/post`, {
                postId: postId,
                images: imageUrls,
                content: message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Member ${userData.token}`
                }
            });


            if (putData.data.status != 200) {
                Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
                deletePost(postId);
            } else {
                refreshHandler();
                navigation.goBack();
            }
        } catch (error) {
            console.log(error)
            Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            deletePost(postId);
        }
    }

    const deletePost = async (postId: string) => {
        if (!postId) return Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        try {
            const postDelete = await axios.delete(`https://friendszone.app/api/post/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData.token}`,
                }
            });

            if (postDelete.status === 200) {
                await deleteImagesFromFirebase(images);
                Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            } else {
                Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            }
        } catch (error) {
            console.error("Error deleting post: ", error);
            Alert.alert('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการดำเนินการ', [{ text: 'ลองอีกครั้ง' }]);
        }
    };

    const deleteImagesFromFirebase = async (imageUrls: string[]) => {
        for (const url of imageUrls) {
            const imageRef = ref(storage, url);

            try {
                await deleteObject(imageRef);
            } catch (error) {
                console.error(`Error deleting image ${url}: `, error);
            }
        }
    };

    const handlePost = async () => {
        setLoading(true);
        try {
            const postCreate = await axios.post('https://friendszone.app/api/post', {
                content: message,
                memberId: userData.id
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Member ${userData.token}`
                }
            });

            if (postCreate.data.status !== 200) {
                if (postCreate.data.data.code == "MEMBER_NOT_FOUND") {
                    return Alert.alert('Error', 'Session หมดอายุ โปรดเข้าสู่ระบบใหม่อีกครั้ง', [{ text: 'OK' }], {
                        onDismiss: async () => {
                            await Logout()
                        }
                    });
                }
                return Alert.alert('ผิดพลาด', 'ไม่สามารถสร้างโพสต์ได้', [{ text: 'ลองอีกครั้ง' }]);
            } else {
                if (images.length > 0) {
                    await uploadImages(postCreate.data.data.id);
                } else {
                    refreshHandler();
                    navigation.goBack();
                }
            }


        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างโพสต์ได้', [{ text: 'ลองอีกครั้ง' }]);
        } finally {
            setLoading(false);
        }
    };

    const refreshHandler = () => {
        setImages([]);
        setMessage('');
    }

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledTouchableWithoutFeedback onPress={Keyboard.dismiss} className="flex-1 bg-white">
                    <StyledView className="flex-1">
                        <LinearGradient
                            colors={['#EB3834', '#69140F']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="w-full top-0 h-[106px]"
                        >
                            <StyledView className="px-3 text-center pt-[60px] pb-3">
                                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[60] ml-4">
                                    <Ionicons name="chevron-back" size={24} color="#fff" />
                                </TouchableOpacity>
                                <StyledText className="font-custom text-center self-center text-lg font-bold text-white">สร้างโพสต์</StyledText>

                                <TouchableOpacity onPress={handlePost} className="absolute right-3 pt-[60] flex-row" disabled={(images.length === 0 && message.length === 0)}>
                                    <StyledText className={`font-custom text-center self-center text-lg font-bold ${images.length > 0 || message.length > 0 ? "text-white" : "text-gray-500"}`}>โพสต์</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                        </LinearGradient>

                        <StyledView className="bg-gray-200 w-full h-[1px]" />

                        <StyledView className="w-full flex-row items-center justify-between">
                            <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px] mt-2" />
                            <StyledView className="flex-row items-center ml-2 rounded-md w-full h-[40px]">
                                <StyledText className="font-custom font-bold">{userData?.username}</StyledText>
                            </StyledView>
                        </StyledView>
                        <StyledView className="w-full px-3">
                            <StyledTextInput
                                placeholder="คุณกำลังคิดอะไรอยู่?"
                                className="py-4 w-full font-custom"
                                value={message}
                                onChangeText={setMessage}
                                inputMode='text'
                                multiline={true}
                                numberOfLines={5}
                                maxLength={messageLimit}
                                onFocus={() => setTextFocus(true)}
                                onBlur={() => setTextFocus(false)}
                                autoCorrect={false}


                            />
                        </StyledView>



                        <StyledView className="bg-gray-200 w-full h-[1px]" />



                        {
                            message.length > 0 && (
                                <>
                                    <StyledText className="text-sm text-gray-500 self-end mr-2 mt-2 font-custom">
                                        {messageLimit - message.length}
                                    </StyledText>
                                </>
                            )
                        }
                        <StyledView className="flex-row flex-wrap">
                            {images.map((imageUri, index) => (
                                <StyledView key={index} style={{ position: 'relative' }} className="shadow-md justify-start mx-1 mt-2">
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: 110, height: 110, borderRadius: 5 }}
                                        onLoad={() => (
                                            <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', top: 40, left: 40 }} />
                                        )}
                                    />
                                    <TouchableOpacity
                                        onPress={() => deleteImage(imageUri)}
                                        style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 50 }}
                                    >
                                        <Ionicons name="close" size={20} color="white" />
                                    </TouchableOpacity>
                                </StyledView>
                            ))}
                        </StyledView>

                        <BottomSheet
                            ref={bottomSheetRef}
                            snapPoints={snapPoints}
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.25,
                            }}
                        >
                            <StyledBottomSheetView className="relative h-[100%]">
                                <StyledView className="flex-1 bg-white">
                                    <StyledView className="mt-2 rounded-lg mx-4">
                                        <StyledView className="my-2 py-1">
                                            <TouchableOpacity onPress={() => { pickImages(); }} className="flex-row items-center" disabled={images.length >= 6}>
                                                <Ionicons name="images" size={24} color={`${images.length >= 6 ? "#99d390" : "#3fd826"}`} />
                                                <StyledText className={`pl-4 text-lg font-custom ${images.length >= 6 ? "text-gray-500" : ""}`}>รูปภาพ/วิดีโอ ({images.length}/{selectcount})</StyledText>
                                            </TouchableOpacity>
                                        </StyledView>
                                        <StyledView className="my-2 py-1">
                                            <TouchableOpacity onPress={() => { /* Call takePicture() if you want to keep camera option */ }} className="flex-row items-center">
                                                <Ionicons name="camera" size={24} color="#2b98e8" />
                                                <StyledText className="pl-4 text-lg font-custom">กล้อง</StyledText>
                                            </TouchableOpacity>
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                            </StyledBottomSheetView>
                        </BottomSheet>
                    </StyledView>
                </StyledTouchableWithoutFeedback>
                <Modal visible={loading} transparent={true} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ActivityIndicator size="large" color="#EB3834" />
                            <StyledText className="font-custom" style={styles.modalText}>กำลังสร้างโพสต์...</StyledText>
                        </View>
                    </View>
                </Modal>


            </KeyboardAvoidingView>

        </>
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