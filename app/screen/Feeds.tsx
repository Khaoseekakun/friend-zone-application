import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, FlatList } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewer from 'react-native-image-zoom-viewer';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Navigation } from "@/components/Menu";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatTimeDifference } from "@/utils/Date";
const GuestIcon = require("../../assets/images/guesticon.jpg")

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);

export default function FeedsTab() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState([] as string[]);
    const [isOpen, setIsOpen] = useState(true);
    interface Post {
        id: number;
        content: string;
        images: string[];
        createdAt: string;
        member: {
            username: string;
            profileUrl: string;
        }
    }

    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);  // Track current page
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);  // Control when to stop loading
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["35%"], []);
    const [userData, setuserData] = useState<any>();

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, []);

    // Fetch posts with pagination
    const fetchPosts = async (pageNumber = 1) => {
        if (loading || !hasMore) return; // Prevent multiple requests
        setLoading(true);

        try {
            const response = await axios.get(`http://49.231.43.37:3000/api/post?loadLimit=10&page=${pageNumber}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const newPosts = response.data.data.posts;
            console.log(newPosts)
            if (newPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...newPosts]); // Append new posts
                setPage(pageNumber); // Update the page number
            } else {
                setHasMore(false); // No more posts to load
            }
        } catch (error) {
            console.error("Error fetching posts", error);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Load more posts when reaching the end of the list
    const loadMorePosts = () => {
        if (!loading && hasMore) {
            fetchPosts(page + 1); // Load the next page of posts
        }
    };

    const openImageModal = (imageUrl: string[]) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const renderFooter = () => {
        if (!loading) return null;
        return <ActivityIndicator size="large" />;
    };

    return (
        <>
            <StyledView className="flex-1 bg-white">
                <StyledView className="w-full flex-row items-center justify-between mt-16 mb-2 px-3">
                    <TouchableOpacity className="flex-row bg-gray-100 items-center mr-3 pl-4 rounded-full w-full h-[40px]" onPress={() => navigation.navigate('PostTab')}>
                        <StyledText className="text-gray-500">โพสต์อะไรสักอย่าง</StyledText>
                    </TouchableOpacity>
                </StyledView>
                
                <StyledView className="bg-gray-200 w-full h-[1px]" />
                <FlatList
                    data={posts}
                    keyExtractor={(item, index) => `${item.id}_${index}`}
                    renderItem={({ item }) => (
                        <StyledView className="">
                            <StyledView className="w-full flex-row items-center justify-between">
                                <TouchableOpacity className="flex-1 flex-row left-0 shadow-sm" onPress={() => navigation.navigate('ProfileTab')}>
                                    <Image className="ml-3 rounded-full w-[40px] h-[40px]" source={item.member?.profileUrl ? { uri: item.member?.profileUrl } : GuestIcon}/>
                                    <StyledView className="pl-3 mt-2 flex-row">
                                        <StyledText className="font-bold text-md">{item.member.username}</StyledText>
                                        <StyledText className="text-md ml-1 text-gray-400">{formatTimeDifference(item.createdAt)}</StyledText>
                                    </StyledView>
                                </TouchableOpacity>
                                <StyledView className="mr-3 flex-row items-center mb-2">
                                    <Ionicons name="ellipsis-horizontal" size={15} color="gray" />
                                </StyledView>
                            </StyledView>

                            <StyledView className="pl-[65px] pr-9">
                                <StyledText className="-mt-3">{item.content}</StyledText>
                                {
                                    item.images.length > 0 ? (
                                        <TouchableOpacity onPress={() => openImageModal(item.images)}>
                                            <StyledImage source={{ uri: item.images[0] }} className="rounded-md bg-gray-500 mt-2 h-96 w-full" />
                                        </TouchableOpacity>
                                    ) : null
                                }
                                <StyledView id="post-action" className="flex-row relative justify-between mt-2">
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
                            
                            <StyledView className="bg-gray-200 w-full h-[1px] my-2" />
                        </StyledView>
                        
                    )}
                    onStartReached={() => fetchPosts}
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />

                <Modal animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <StyledView className="flex-1 justify-center h-screen bg-black">
                        <StyleImageViewer
                            imageUrls={selectedImage.map(image => ({ url: image }))} // Pass an array of images
                            enableImageZoom={true}
                            className="w-full h-screen"
                            loadingRender={() => <ActivityIndicator size="large" color="#ffffff" />}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="absolute top-12 p-2 rounded-full">
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
            </StyledView >
        </>
    );
}
