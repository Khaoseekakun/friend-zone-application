import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, SafeAreaView } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewer from 'react-native-image-zoom-viewer';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Navigation } from "@/components/Menu";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);

export default function FeedsTab() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [isOpen, setIsOpen] = useState(true);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["35%"], []);

    const BottomSheetShow = useCallback((index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
        setIsOpen(true);
    }, []);

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    return (
        <>
            <StyledView className="flex-1">
                <ScrollView className="flex-1 w-full mt-6 self-center">
                    <StyledView className="pt-10 w-full">
                        <StyledView className="">
                            <StyledView className="w-full flex-row items-center justify-between">

                                <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                <TouchableOpacity className="flex-row items-center ml-3 rounded-md w-full h-[40px]" onPress={() => navigation.navigate('PostTab')}>
                                    <StyledText>โพสต์อะไรสักอย่าง</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            <StyledView className="bg-gray-200 w-full h-[1px] my-2" />
                        </StyledView>


                        <StyledView>
                            <StyledView className="w-full flex-row items-center justify-between">
                                <TouchableOpacity className="flex-1 flex-row left-0" onPress={() => navigation.navigate('ProfileTab')}>
                                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                    <StyledView className="pl-3 mt-2 flex-row">
                                        <StyledText className="font-bold text-md mt-2">Friend Zone</StyledText>
                                        <StyledText className="text-md mt-2 ml-1 text-gray-400">23 ชม.</StyledText>
                                    </StyledView>
                                </TouchableOpacity>
                                <StyledView className="mr-3 flex-row items-center mb-2">
                                    <Ionicons
                                        name="ellipsis-horizontal"
                                        size={15}
                                        color="gray"
                                        accessibilityLabel="Settings"
                                        onPress={() => BottomSheetShow(0)}
                                    />
                                </StyledView>
                            </StyledView>
                            <StyledView id={"POST-ID"} className="pl-[73px] pr-9">
                                <StyledText className="-mt-2">
                                    สวัสดีฉันชื่อเฟรนด์ ฉันเป็นคนที่ชอบเล่นเกม และชอบดูหนัง และชอบเล่นกับเพื่อนๆ
                                </StyledText>
                                <TouchableOpacity onPress={() => openImageModal("https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-autumn-nature-with-a-river-in-the-middle-of-the-forest-free-image.jpeg?w=1920")}>
                                    <StyledImage
                                        source={{ uri: "https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-autumn-nature-with-a-river-in-the-middle-of-the-forest-free-image.jpeg?w=1920" }}
                                        className="rounded-md bg-gray-500 mt-2 h-96 w-full"
                                    />
                                </TouchableOpacity>

                                <StyledView id="post-action" className="flex-row relative justify-between mt-2 px-3">
                                    <StyledView className="flex-row justify-center items-center">
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={18}
                                            color="black"
                                            onPress={() => { }}
                                        />
                                        <StyledText>100</StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row justify-center items-center">
                                        <Ionicons
                                            name="repeat-outline"
                                            size={18}
                                            color="green"
                                            onPress={() => { }}
                                        />
                                        <StyledText>100</StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row justify-center items-center">
                                        <Ionicons
                                            name="heart"
                                            size={18}
                                            color="red"
                                            onPress={() => { }}
                                        />
                                        <StyledText>100</StyledText>
                                    </StyledView>

                                    <StyledView className="flex-row justify-center items-center">
                                        <Ionicons
                                            name="share-outline"
                                            size={18}
                                            color="black"
                                            onPress={() => { }}
                                        />
                                    </StyledView>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                </ScrollView>

                <Modal
                    animationType="fade"
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <StyledView className="flex-1 justify-center h-screen bg-black">
                        <StyleImageViewer
                            imageUrls={[{ url: selectedImage }]}
                            enableImageZoom={true}
                            className="w-full h-screen"
                            loadingRender={() => (
                                <ActivityIndicator size="large" color="#ffffff" />
                            )}
                        />
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="absolute top-12 p-2 rounded-full"
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </StyledView>
                </Modal>


                <Navigation />
                <HeaderApp />

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
                    <BottomSheetView style={{ height: "100%" }}>
                        <StyledView className="flex-1 bg-white">
                            <StyledView className="mt-5 bg-gray-100 rounded-lg mx-5">
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="information-circle-outline"
                                            size={24}
                                            color="black"
                                        />
                                        <StyledText className="pl-2 text-lg">เกี่ยวกับบัญชีนี้</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                                <StyledView className="bg-gray-200 w-full h-[1px]" />
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={24}
                                            color="black"
                                        />
                                        <StyledText className="pl-2 text-lg">ความเป็นส่วนตัว</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                                <StyledView className="bg-gray-200 w-full h-[1px]" />
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={24}
                                            color="black"
                                        />
                                        <StyledText className="pl-2 text-lg">ทำไมคุณจึงเห็นโพสต์นี้</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                                <StyledView className="bg-gray-200 w-full h-[1px]" />
                                <StyledView className="my-2 px-3 py-1">
                                    <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                        <Ionicons
                                            name="warning-outline"
                                            size={24}
                                            color="#ff2525"
                                        />
                                        <StyledText className="text-[#ff2525] pl-2 text-lg">รายงานปัญหา</StyledText>
                                    </TouchableOpacity>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </BottomSheetView>
                </BottomSheet>
            </StyledView>
        </>
    );
}
