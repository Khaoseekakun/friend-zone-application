import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Image, ActivityIndicator, FlatList, Alert, StyleSheet, SafeAreaView } from "react-native";
import { styled } from "nativewind";
import { HeaderApp } from "@/components/Header";
import { useNavigation } from "expo-router";
import { NavigationProp, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ImageViewer from 'react-native-image-zoom-viewer';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatTimeDifference } from "@/utils/Date";
import { deleteObject, getStorage, ref } from "firebase/storage";
import { Navigation } from "@/components/Navigation";
import FireBaseApp from "@/utils/firebaseConfig";
import { RootStackParamList } from "@/types";
const GuestIcon = require("../../assets/images/guesticon.jpg")

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);

const storage = getStorage(FireBaseApp);

export default function FeedsTab() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState([] as string[]);
    const [isOpen, setIsOpen] = useState(false);
    interface Post {
        id: string;
        content: string;
        images: string[];
        createdAt: string;
        member: {
            id: string;
            username: string;
            profileUrl: string;
            verified: boolean;
        }
    }
    const [isDeleting, setIsDeleting] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["35%"], []);
    const [userData, setuserData] = useState<any>();
    const [postAction, setPostAction] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            handleRefresh()
        }
    }, [isFocused]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setuserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
    }, []);

    const fetchPosts = async (pageNumber = 1) => {
        if (refreshing != false) {
            if (loading || !hasMore) return
        }

        try {
            const response = await axios.get(`https://friendszone.app/api/post?loadLimit=${pageNumber != 1 ? "1" : "10"}&orderBy=${!refreshing ? "desc" : "none"}&page=${pageNumber}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const newPosts = response.data.data.posts;
            if (newPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setPage(pageNumber++);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching posts", error);
        }

        setLoading(false);
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

    const loadMorePosts = () => {
        if (!loading && hasMore) {
            fetchPosts(page + 1);
        }
    };

    const BottomSheetShow = useCallback((index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
        setIsOpen(true);
    }, []);

    const openImageModal = (imageUrl: string[], index: number = 0) => {
        setSelectedImage(imageUrl);
        setSelectedImageIndex(index);
        setModalVisible(true);
    };

    const renderFooter = () => {

        loadMorePosts();

        if (!loading) return <>
            <StyledView className="mb-[120px]" />
        </>

    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setPosts([]);
        await fetchPosts();
        setRefreshing(false);
    };

    const deleteTwoStep = async (postId: string) => {
        Alert.alert('ยืนยันการลบ', 'คุณต้องการลบโพสต์นี้ใช่หรือไม่', [{
            text: 'ยกเลิก',
            style: 'cancel'
        }, {
            text: 'ลบ', onPress: () => deletePost(postId)
        }])
    }


    const deletePost = async (postId: string) => {

        setIsDeleting(true);

        try {
            const deleteData = await axios.delete('https://friendszone.app/api/post/' + postId, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData?.token}`
                }
            });

            if (deleteData.data.status !== 200) {
                Alert.alert('ผิดพลาด', 'ไม่สามารถลบโพสต์ได้', [{ text: 'ลองอีกครั้ง', onPress: () => deletePost(postId), style: 'cancel' }, { text: 'ตกลง' }]);
            } else {
                setRefreshing(true);
                if ((posts.find((p) => p.id === postId)?.images?.length ?? 0) > 0) {
                    await deleteImagesFromFirebase(posts.find(p => p.id === postId)?.images || []);
                }
                setPosts([]);
                await fetchPosts();
                setRefreshing(false);
                bottomSheetRef.current?.close();
            }
        } catch (error) {
            Alert.alert('ผิดพลาด', 'ไม่สามารถลบโพสต์ได้', [{ text: 'ลองอีกครั้ง', onPress: () => deletePost(postId), style: 'cancel' }, { text: 'ตกลง' }]);
        } finally {
            setIsDeleting(false);
        }
    }

    const handleGotoEditPost = () => {
        if (!posts.find((p) => p.id === postAction)) return Alert.alert('ผิดพลาด', 'ไม่พบข้อมูลของโพสต์นี้', [{ text: 'ตกลง' }]);
        navigation.navigate("PostUpdate", { post: posts.find((p) => p.id === postAction) as any })
        bottomSheetRef.current?.close();
    }

    return (

        <StyledView className="flex-1">
            <HeaderApp />
            <FlatList
                data={posts}
                keyExtractor={(item, index) => `${item.id}_${index}`}
                renderItem={({ item }) => (

                    <StyledView className="mt-2">
                        <StyledView className="bg-gray-200 w-full h-[1px] my-2" />
                        <StyledView className="w-full flex-row items-center justify-between">
                            <TouchableOpacity className="flex-1 flex-row left-0 shadow-sm" onPress={() => navigation.navigate('ProfileTab', { profileId: item.member.id })}>
                                <Image className="ml-3 rounded-full w-[40px] h-[40px]" source={item.member?.profileUrl ? { uri: item.member?.profileUrl } : GuestIcon} />
                                <StyledView className="pl-3 mt-2 flex-row">
                                    <StyledText className="font-custom font-bold text-md">{item.member.username} </StyledText>
                                    {item.member.verified == true ? (<StyledView className="-mt-1"><Ionicons name={'checkmark-done'} size={18} color={'#dd164f'} /></StyledView>) : <></>}
                                    <StyledText className="font-custom text-md ml-1 text-gray-400">{formatTimeDifference(item.createdAt)}</StyledText>
                                </StyledView>
                            </TouchableOpacity>
                            <StyledView className="mr-3 flex-row items-center mb-2">
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={22}
                                    color="gray"
                                    accessibilityLabel="Settings"
                                    onPress={() => { BottomSheetShow(0), setPostAction(item.id) }}
                                />
                            </StyledView>
                        </StyledView>

                        <StyledView className="pl-[65px] pr-9">
                            <StyledText className="font-custom -mt-3">{item.content}</StyledText>
                            {
                                item.images.length === 1 ? (
                                    <>
                                        <TouchableOpacity onPress={() => openImageModal(item.images)}>
                                            <StyledImage source={{ uri: item.images[0] }} className="rounded-md mt-2 h-96 w-full" />
                                        </TouchableOpacity>
                                    </>
                                ) : item.images.length === 2 ? (
                                    <>
                                        <StyledView className="max-h-[350px] mb-2">
                                            <TouchableOpacity onPress={() => openImageModal(item.images, 0)}>
                                                <StyledImage source={{ uri: item.images[0] }} className="rounded-t-md mt-2 h-[175px] w-full" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => openImageModal(item.images, 1)}>
                                                <StyledImage source={{ uri: item.images[1] }} className="rounded-b-md h-[175px] w-full" />
                                            </TouchableOpacity>
                                        </StyledView>
                                    </>
                                ) : item.images.length === 3 ? (
                                    <>
                                        <StyledView className="max-h-[350px] mb-2">
                                            <TouchableOpacity onPress={() => openImageModal(item.images, 0)}>
                                                <StyledImage source={{ uri: item.images[0] }} className="rounded-t-md mt-2 h-[175px] w-full" />
                                            </TouchableOpacity>
                                            <StyledView className="flex-row">
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 1)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[1] }} className="rounded-bl-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 2)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[2] }} className="rounded-br-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                            </StyledView>
                                        </StyledView>
                                    </>
                                ) : item.images.length === 4 ? (
                                    <>
                                        <StyledView className="max-h-[350px] mb-2">
                                            <StyledView className="flex-row">
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 0)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[0] }} className="rounded-tl-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 1)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[1] }} className="rounded-tr-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                            </StyledView>

                                            <StyledView className="flex-row">
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 2)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[2] }} className="rounded-bl-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 3)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[3] }} className="rounded-br-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                            </StyledView>
                                        </StyledView>
                                    </>
                                ) : item.images.length > 4 ? (
                                    <>
                                        <StyledView className="max-h-[350px] mb-2 shadow-sm">
                                            <StyledView className="flex-row">
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 0)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[0] }} className="rounded-tl-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 1)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[1] }} className="rounded-tr-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                            </StyledView>

                                            <StyledView className="flex-row">
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 2)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[2] }} className="rounded-bl-md h-[175px] w-full" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openImageModal(item.images, 3)} className="w-1/2">
                                                    <StyledImage source={{ uri: item.images[3] }} className="rounded-br-md h-[175px] w-full" />
                                                    <StyledView className="absolute top-0 right-0 bg-black rounded-br-md opacity-50 w-full h-full flex-row justify-center items-center">

                                                    </StyledView>
                                                    <StyledView className="absolute top-0 right-0 w-full h-full flex-row justify-center items-center">
                                                        <StyledText className="font-custom text-white absolute text-center text-2xl" style={{ alignSelf: 'center' }}>
                                                            +{item.images.length - 4}
                                                        </StyledText>
                                                    </StyledView>

                                                </TouchableOpacity>
                                            </StyledView>
                                        </StyledView>
                                    </>
                                ) : null
                            }
                            <StyledView id="post-action" className="flex-row relative justify-start mt-2">


                                <StyledView className="flex-row justify-center mr-5 items-center">
                                    <Ionicons
                                        name="heart"
                                        size={18}
                                        color="red"
                                        onPress={() => { }}
                                    />
                                    <StyledText className="font-custom">0</StyledText>
                                </StyledView>

                                <StyledView className="flex-row justify-center mr-5 items-center">
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={18}
                                        color="black"
                                        onPress={() => { }}
                                    />
                                    <StyledText className="font-custom">0</StyledText>
                                </StyledView>


                            </StyledView>
                        </StyledView>
                    </StyledView>

                )}
                onEndReached={() => loadMorePosts()}
                ListFooterComponent={() => renderFooter()}
                refreshing={refreshing}
                onStartReachedThreshold={5}
                onEndReachedThreshold={0.8}
                onRefresh={() => handleRefresh()}
                ListHeaderComponent={() => {
                    if (userData?.role != 'customer') {
                        return (
                            <StyledView className="w-full flex-row items-center justify-between mt-3 mb-3 px-3">
                                <TouchableOpacity
                                    className="flex-row bg-gray-300 items-center mr-3 pl-4 rounded-full w-full h-[40px]"
                                    onPress={() => navigation.navigate('PostTab')}
                                >
                                    <StyledText className="text-black font-custom">โพสต์อะไรสักอย่าง</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                        );
                    }
                    return null;
                }}
            />

            <Navigation current="FeedsTab" />
            <Modal animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <StyledView className="flex-1 justify-center h-screen bg-black">
                    <StyleImageViewer
                        imageUrls={selectedImage.map(image => ({ url: image }))} // Pass an array of images
                        enableImageZoom={true}
                        className="w-full h-screen"
                        index={selectedImageIndex}
                        loadingRender={() => <ActivityIndicator size="large" color="#ffffff" />}
                    />
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="absolute top-12 p-2 rounded-full">
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                </StyledView>
            </Modal>

            <Modal
                visible={isDeleting}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDeleting(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#EB3834" />
                        <StyledText className="font-custom" style={styles.modalText} >กำลังลบโพสต์...</StyledText>
                    </View>
                </View>
            </Modal>



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
                                <TouchableOpacity onPress={() => navigation.navigate("ProfileTab", { profileId: posts.find((p) => p.id == postAction)?.member.id ?? "" })} className="flex-row items-center">
                                    <Ionicons
                                        name="information-circle-outline"
                                        size={24}
                                        color="black"
                                    />
                                    <StyledText className="pl-2 text-lg font-custom">เกี่ยวกับบัญชีนี้</StyledText>
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
                                    <StyledText className="pl-2 text-lg font-custom">ความเป็นส่วนตัว</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            {
                                posts.some((p) => p.id === postAction && p.member.id === userData?.id) ? null :
                                    (
                                        <>

                                            <StyledView className="bg-gray-200 w-full h-[1px]" />
                                            <StyledView className="my-2 px-3 py-1">
                                                <TouchableOpacity onPress={() => setIsOpen(false)} className="flex-row items-center">
                                                    <Ionicons
                                                        name="alert-circle-outline"
                                                        size={24}
                                                        color="black"
                                                    />
                                                    <StyledText className="pl-2 text-lg font-custom">ทำไมคุณจึงเห็นโพสต์นี้</StyledText>
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
                                                    <StyledText className="text-[#ff2525] pl-2 text-lg font-custom">รายงานปัญหา</StyledText>
                                                </TouchableOpacity>
                                            </StyledView></>
                                    )

                            }
                        </StyledView>

                        {
                            posts.some((p) => p.id === postAction && p.member.id === userData?.id) ? (
                                <>
                                    <StyledView className="mt-4 bg-gray-100 rounded-lg mx-5">
                                        <StyledView className="my-2 px-3 py-1">
                                            <TouchableOpacity onPress={() => { handleGotoEditPost() }} className="flex-row items-center">
                                                <Ionicons
                                                    name="pencil-outline"
                                                    size={24}
                                                    color="black"
                                                />
                                                <StyledText className="pl-2 text-lg font-custom">แก้ไข</StyledText>
                                            </TouchableOpacity>
                                        </StyledView>
                                        <StyledView className="bg-gray-200 w-full h-[1px]" />
                                        <StyledView className="my-2 px-3 py-1">
                                            <TouchableOpacity onPress={() => deleteTwoStep(postAction)} className="flex-row items-center">
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={24}
                                                    color="#ff2525"
                                                />
                                                <StyledText className="text-[#ff2525] pl-2 text-lg font-custom">ลบโพสต์</StyledText>
                                            </TouchableOpacity>
                                        </StyledView>
                                    </StyledView>
                                </>
                            ) : null

                        }

                    </StyledView>
                </BottomSheetView>
            </BottomSheet>
        </StyledView >
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