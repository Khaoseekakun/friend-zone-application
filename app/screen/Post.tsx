import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { styled } from "nativewind";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Camera, CameraType } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
const StyledView = styled(View);
const StyledText = styled(Text);


const StyledTextInput = styled(TextInput);
const StyledBottomSheetView = styled(BottomSheetView);
export default function Post() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const cameraRed = useRef<any>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["20%","5%"], []);


    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, [])

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StyledView className="flex-1 bg-white">
                <StyledView className="bg-gray-50 px-3 text-center py-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute">
                        <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                    </TouchableOpacity>
                    <StyledText className="text-center self-center text-lg font-bold">สร้างโพสต์</StyledText>
                </StyledView>

                <StyledView className="bg-gray-200 w-full h-[1px]" />
                <StyledView className="w-full flex-row items-center justify-between">
                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px] mt-2" />
                    <StyledView className="flex-row items-center ml-2 rounded-md w-full h-[40px]">
                        <StyledText className="font-bold">UserName</StyledText>
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
                            <StyledView className="mt-5 bg-gray-100 rounded-lg mx-5">
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="images-outline"
                                            size={24}
                                            color="black"
                                        />
                                        <StyledText className="pl-2 text-lg">รูปภาพ/วิดีโอ</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                                <StyledView className="bg-gray-200 w-full h-[1px]" />
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="camera-outline"
                                            size={24}
                                            color="black"
                                        />
                                        <StyledText className="pl-2 text-lg">กล้อง</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledBottomSheetView>
                </BottomSheet>
        </KeyboardAvoidingView>
    );
}
