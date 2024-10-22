import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export default function FeedsTab() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    return (
        <StyledView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 w-full mt-6 self-center ">
                <StyledView className="pt-10 w-full">
                    <StyledView>
                        <StyledView className="w-full flex-row items-center justify-between">
                            <TouchableOpacity className="flex-1 flex-row left-0" onPress={() => navigation.navigate('ProfileTab')}>
                                <StyledView className="ml-3 bg-gray-400 rounded-full w-[50px] h-[50px]"></StyledView>
                                <StyledView className="pl-3">
                                    <StyledText className="font-bold text-lg">Friend Zone</StyledText>
                                </StyledView>
                            </TouchableOpacity>
                            <StyledView className="mr-3 flex-row items-center">
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={24}
                                    color="black"
                                    onPress={() => { }}
                                    accessibilityLabel="Settings"
                                />
                            </StyledView>
                        </StyledView>
                        <StyledView id={"POST-ID"} className="pl-[73px] pr-9">
                            <StyledText>
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
                                    >
                                    </Ionicons>
                                    <StyledText>100</StyledText>
                                </StyledView>
                                
                                <StyledView className="flex-row justify-center items-center">
                                    <Ionicons
                                        name="repeat-outline"
                                        size={18}
                                        color="green"
                                        onPress={() => { }}
                                    >
                                    </Ionicons>
                                    <StyledText>100</StyledText>
                                </StyledView>
                                
                                <StyledView className="flex-row justify-center items-center">
                                    <Ionicons
                                        name="heart"
                                        size={18}
                                        color="red"
                                        onPress={() => { }}
                                    >
                                    </Ionicons>
                                    <StyledText>100</StyledText>
                                </StyledView>
                                
                                <StyledView className="flex-row justify-center items-center">
                                    <Ionicons
                                        name="share-outline"
                                        size={18}
                                        color="black"
                                        onPress={() => { }}
                                    >
                                    </Ionicons>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <StyledView className="flex-1 h-5/6 justify-center bg-black">
                    <Ionicons
                        name="close"
                        size={32}
                        color="white"
                        onPress={() => setModalVisible(false)}
                        accessibilityLabel="Close"
                        className="relative top-0 right-0 m-4"
                    />
                    <StyledImage
                        source={{ uri: selectedImage }}
                        className="rounded-md w-full h-96"
                        resizeMode="contain"
                    />
                </StyledView>
            </Modal>

            <HeaderApp />
        </StyledView>
    );
}
