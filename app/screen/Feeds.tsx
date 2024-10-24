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

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);

export default function FeedsTab() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    interface Post {
        id: number;
        content: string;
        images: string;
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
            console.log(userData?.token)
            const response = await axios.get(`http://49.231.43.37:3000/api/post?loadLimit=10&page=${pageNumber}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(response.data)

            const newPosts = response.data;

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

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const renderFooter = () => {
        if (!loading) return null;
        return <ActivityIndicator size="large" />;
    };

    return (
        <>
            <StyledView className="flex-1">

                <StyledView className="w-full flex-row items-center justify-between mt-52">
                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px]" />
                    <TouchableOpacity className="flex-row items-center ml-3 rounded-md w-full h-[40px]" onPress={() => navigation.navigate('PostTab')}>
                        <StyledText>โพสต์อะไรสักอย่าง</StyledText>
                    </TouchableOpacity>
                </StyledView>
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <StyledView>
                            <StyledView className="w-full flex-row items-center justify-between">
                                <TouchableOpacity className="flex-1 flex-row left-0" onPress={() => navigation.navigate('ProfileTab')}>
                                    <StyledView className="ml-3 bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                    <StyledView className="pl-3 mt-2 flex-row">
                                        <StyledText className="font-bold text-md mt-2">{'test'}</StyledText>
                                        <StyledText className="text-md mt-2 ml-1 text-gray-400">{'10ชม.'}</StyledText>
                                    </StyledView>
                                </TouchableOpacity>
                                <StyledView className="mr-3 flex-row items-center mb-2">
                                    <Ionicons name="ellipsis-horizontal" size={15} color="gray" />
                                </StyledView>
                            </StyledView>
                            <StyledView className="pl-[73px] pr-9">
                                <StyledText className="-mt-2">{item.content}</StyledText>
                                <TouchableOpacity onPress={() => openImageModal(item.images)}>
                                    <StyledImage source={{ uri: item.images }} className="rounded-md bg-gray-500 mt-2 h-96 w-full" />
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
                    )}
                    onEndReached={loadMorePosts}  // Load more when scrolled to bottom
                    onEndReachedThreshold={0.5}   // When to trigger load more (50% from bottom)
                    ListFooterComponent={renderFooter}  // Show loading spinner at bottom
                />

                <Modal animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <StyledView className="flex-1 justify-center h-screen bg-black">
                        <StyleImageViewer
                            imageUrls={[{ url: selectedImage }]}
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
            </StyledView >
        </>
    );
}
