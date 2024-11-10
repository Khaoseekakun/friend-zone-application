import React, { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
const GuestIcon = require("../../assets/images/guesticon.jpg")

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledImage = styled(Image);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
type PostUpdateParam = RouteProp<RootStackParamList, 'PostUpdate'>;
export default function PostUpdate() {
    const route = useRoute<PostUpdateParam>();

    const { id, content, member, images } = route.params.post;
    const navigation = useNavigation<NavigationProp<any>>();
    const [message, setMessage] = useState('');
    const [userData, setuserData] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [loadingImages, setLoadingImages] = useState(new Array(images.length).fill(true));

    const messageLimit = 512;

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData as string) || {});
        };

        fetchUserData();
        setMessage(content);
    }, []);

    const upDateTwoStep = async (postId: string) => {
        Alert.alert('ยืนยันการแก้ไข', '', [{
            text: 'ยกเลิก',
            style: 'cancel'
        }, {
            text: 'ยืนยัน', onPress: () => PostUpdate(postId),
            style: "destructive"
        }])
    }

    const PostUpdate = async (postId: string) => {

        if (!postId) return Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        try {
            const putData = await axios.put(`https://friendszone.app/api/post`, {
                postId: postId,
                content: message,
                images: images
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Member ${userData.token}`
                }
            });


            if (putData.data.status != 200) {
                Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
            } else {
                navigation.goBack();
            }
        } catch (error) {
            console.log(error)
            Alert.alert('ผิดพลาด', 'ไม่สามารถอัปเดตโพสต์ได้ กรุณาลองใหม่อีกครั้ง', [{ text: 'OK' }]);
        }
    }

    const handleImageLoad = (index: number) => {
        setLoadingImages((prev) => {
            const newLoading = [...prev];
            newLoading[index] = false;
            return newLoading;
        });
    };

    return (
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
                            <StyledText className="text-center self-center text-lg font-bold text-white">แก้ไขโพสต์</StyledText>

                            <TouchableOpacity onPress={() => upDateTwoStep(id)} className="absolute right-3 pt-[60] flex-row" disabled={(message.length == 0 || (message == content))}>
                                <StyledText className={`text-center self-center text-lg font-bold ${message.length > 0 ? "text-white" : "text-gray-500"}`}>แก้ไข</StyledText>
                            </TouchableOpacity>
                        </StyledView>
                    </LinearGradient>

                    <StyledView className="bg-gray-200 w-full h-[1px]" />

                    <StyledView className="w-full flex-row items-center justify-between">
                        <StyledImage source={
                            userData?.profileUrl ?
                                { uri: userData?.profileUrl } :
                                GuestIcon
                        } className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px] mt-2" />
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
                            multiline={true}
                            numberOfLines={5}
                            maxLength={messageLimit}
                        />
                    </StyledView>

                    <StyledView className="bg-gray-200 w-full h-[1px]" />

                    {
                        message.length > 0 && (
                            <>
                                <StyledText className="text-sm text-gray-500 self-end mr-2 mt-2">
                                    {messageLimit - message.length}
                                </StyledText>
                            </>
                        )
                    }
                    <StyledView className="flex-row flex-wrap">
                        {images.map((imageUri, index) => (
                            <StyledView key={index} style={{ position: 'relative' }} className="shadow-md justify-start mx-1 mt-2">
                                {images[index] && (
                                    <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', top: 40, left: 40 }} />
                                )}
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: 110, height: 110, borderRadius: 5 }}
                                    onLoad={() => (
                                        <ActivityIndicator size="small" color="#000" style={{ position: 'absolute', top: 40, left: 40 }} />
                                    )}
                                />
                            </StyledView>
                        ))}
                    </StyledView>
                </StyledView>
            </StyledTouchableWithoutFeedback>

            <Modal visible={loading} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#EB3834" />
                        <Text style={styles.modalText}>กำลังสร้างโพสต์...</Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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