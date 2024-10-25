import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { initializeApp } from "firebase/app";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Logout } from "@/utils/Auth/Logout";
import * as ImageManipulator from 'expo-image-manipulator';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledBottomSheetView = styled(BottomSheetView);

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
const db = getFirestore(app);

export default function Post() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["20%"], []);
    const selectcount = 6;
    const [loadingImages, setLoadingImages] = useState(new Array(images.length).fill(true));
    const [userData, setuserData] = useState<any>();
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(''); 

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData as string) || {});
        };

        fetchUserData();
    }, []);

    const handleImageLoad = (index: number) => {
        setLoadingImages((prev) => {
            const newLoading = [...prev];
            newLoading[index] = false;
            return newLoading;
        });
    };

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
        if(!postId) return Alert.alert('Error', 'Failed to upload images. Please try again.', [{ text: 'OK' }]);
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
        if(!postId) return Alert.alert('Error', 'Failed to update the post. Please try again.', [{ text: 'OK' }]);
        try {
            const putData = await axios.put(`http://49.231.43.37:3000/api/post`, {
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
                setStatusMessage("Failed to update post. Deleting the post.");
                deletePost(postId);
            } else {
                setStatusMessage("Post updated successfully.");
                navigation.goBack();
            }
        } catch (error) {
            console.log(error)
            setStatusMessage("Failed to update post. Deleting the post.");
            deletePost(postId);
        }
    }

    const deletePost = async (postId: string) => {
        if(!postId) return Alert.alert('Error', 'Failed to delete the post. Please try again.', [{ text: 'OK' }]);
        try {
            const postDelete = await axios.delete(`http://49.231.43.37:3000/api/post/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Member ${userData.token}`,
                }
            });

            if (postDelete.status === 200) {
                await deleteImagesFromFirebase(images);
                setStatusMessage("Post deleted successfully.");
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to delete the post. Please try again.', [{ text: 'OK' }]);
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
        setLoading(true); // Show loading screen
        setStatusMessage("Creating post..."); // Show status message
        try {
            const postCreate = await axios.post('http://49.231.43.37:3000/api/post', {
                content: message,
                memberId: userData.id
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Member ${userData.token}`
                }
            });

            console.log(postCreate.data)

            if (postCreate.data.status !== 200) {
                if(postCreate.data.data.code == "MEMBER_NOT_FOUND"){
                    return Alert.alert('Error', 'Session หมดอายุ โปรดเข้าสู่ระบบใหม่อีกครั้ง', [{ text: 'OK' }], {
                        onDismiss: async() => {
                            await Logout()
                        }
                    });
                }
                return Alert.alert('Error', 'Failed to create post. Please try again.', [{ text: 'OK' }]);
            } else {
                if (images.length > 0) {
                    await uploadImages(postCreate.data.data.id);
                } else {
                    navigation.goBack();
                }
            }


        } catch (error) {
            setStatusMessage("Failed to create post.");
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างโพสต์ได้', [{ text: 'ลองอีกครั้ง' }]);
        } finally {
            setLoading(false); // Hide loading screen
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="flex-1 bg-white">
                <StyledView className="bg-gray-50 px-3 text-center py-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute mt-4 ml-4">
                        <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                    </TouchableOpacity>
                    <StyledText className="text-center self-center text-lg font-bold">สร้างโพสต์</StyledText>

                    <TouchableOpacity onPress={handlePost} className="absolute right-3 top-4 flex-row" disabled={(images.length === 0 && message.length === 0)}>
                        <StyledText className={`text-center self-center text-lg font-bold ${images.length > 0 || message.length > 0 ? "text-blue-700" : "text-gray-500"}`}>โพสต์</StyledText>
                    </TouchableOpacity>
                </StyledView>

                <StyledView className="bg-gray-200 w-full h-[1px]" />
                <StyledView className="w-full flex-row items-center justify-between">
                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px] mt-2" />
                    <StyledView className="flex-row items-center ml-2 rounded-md w-full h-[40px]">
                        <StyledText className="font-bold">{userData?.username}</StyledText>
                    </StyledView>
                </StyledView>
                <StyledView className="w-full px-3">
                    <StyledTextInput
                        placeholder="คุณกำลังคิดอะไรอยู่?"
                        className="py-4 w-full"
                        value={message}
                        onChangeText={setMessage}
                        inputMode='text'
                    />
                </StyledView>

                <StyledView className="flex-row flex-wrap">
                    {images.map((imageUri, index) => (
                        <StyledView key={index} style={{ position: 'relative' }} className="shadow-md justify-start mx-1 mt-2">
                            {loadingImages[index] && (
                                <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', top: 40, left: 40 }} />
                            )}
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: 110, height: 110, borderRadius: 5 }}
                                onLoad={() => handleImageLoad(index)}
                            />
                            {!uploading && (
                                <TouchableOpacity
                                    onPress={() => deleteImage(imageUri)}
                                    style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 50 }}
                                >
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            )}
                        </StyledView>
                    ))}
                </StyledView>
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
                <StyledBottomSheetView className="h-full">
                    <StyledView className="flex-1 bg-white">
                        <StyledView className="mt-5 rounded-lg mx-4">
                            <StyledView className="my-2 py-1">
                                <TouchableOpacity onPress={() => { pickImages(); setIsOpen(false); }} className="flex-row items-center" disabled={images.length >= 6}>
                                    <Ionicons name="images" size={24} color={`${images.length >= 6 ? "#99d390" : "#3fd826"}`} />
                                    <StyledText className={`pl-4 text-lg ${images.length >= 6 ? "text-gray-500" : ""}`}>รูปภาพ/วิดีโอ ({images.length}/{selectcount})</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                            <StyledView className="my-2 py-1">
                                <TouchableOpacity onPress={() => { /* Call takePicture() if you want to keep camera option */ }} className="flex-row items-center">
                                    <Ionicons name="camera" size={24} color="#2b98e8" />
                                    <StyledText className="pl-4 text-lg">กล้อง</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                </StyledBottomSheetView>
            </BottomSheet>

            <Modal visible={loading} transparent={true} animationType="slide">
                <StyledView className="flex-1 items-center justify-center bg-black bg-opacity-50">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <StyledText className="mt-4 text-white text-lg">{statusMessage}</StyledText>
                </StyledView>
            </Modal>
        </KeyboardAvoidingView>
    );
}
