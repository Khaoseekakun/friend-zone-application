
import { RootStackParamList } from '@/types';
import { Comments, Likes, MembersDB } from '@/types/prismaInterface';
import { formatTimeDifference } from '@/utils/Date';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Appearance, Image, Keyboard, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';

const GuestIcon = require("../../assets/images/guesticon.jpg")
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);
const StyledIonicons = styled(Ionicons);
const StyledInput = styled(TextInput)
const StyledTouchableOpacity = styled(TouchableOpacity)
interface UserProfile {
    id: string;
    images: Array<string>;
    bio: string;
    education: string;
    location: string;
    height: string;
    weight: string;
}

interface Post {
    id: string;
    content: string;
    images: string[];
    createdAt: string;
    member: MembersDB
    _count: {
        comments: number,
        likes: number
    }
    likes: Likes[]
}

type PostUpdateParam = RouteProp<RootStackParamList, 'PostView'>;

export default function PostView() {

    const route = useRoute<PostUpdateParam>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()

    const { item, backPage } = route.params;

    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState<UserProfile | null>(null);

    const snapPointsComment = ['25%'];
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState([] as string[]);
    const [isOpen, setIsOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const bottomSheetRefComment = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["35%"], []);
    const [userData, setuserData] = useState<any>();
    const [postAction, setPostAction] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [newComment, setNewComment] = useState("")
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [commentId, setCommantId] = useState("")
    const [commentList, setComment] = useState<Comments[]>([])
    const [inputDisable, setInputDisable] = useState(false)
    const isFocus = useIsFocused()

    const deleteTwoStep = async (postId: string) => {
        Alert.alert('ยืนยันการลบ', 'คุณต้องการลบโพสต์นี้ใช่หรือไม่', [{
            text: 'ยกเลิก',
            style: 'cancel'
        }, {
            text: 'ลบ', onPress: () => deletePost(postId)
        }])
    }

    useEffect(() => {
        setComment([])
    }, [])


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
                navigation.goBack()
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

    useEffect(() => {
        if (isFocus) {
            setInputDisable(false)
        }
        fetchUserData();

        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, [isFocus]);

    useEffect(() => {
        fetchComent()
    }, [userData])

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const userList = JSON.parse(userData);
                setuserData(userList)
                const response = await axios.get(`https://friendszone.app/api/profile/${userList.id}`, {
                    headers: {
                        "Authorization": `All ${userList?.token}`
                    }
                });

                if (response.data.status === 200) {
                    const profile = response.data.data.profile;
                    setProfileData(profile);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const BottomSheetShow = useCallback((index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
        setIsOpen(true);
    }, []);

    const BottomSheetShowComment = () => {
        bottomSheetRefComment.current?.snapToIndex(0);
        setIsOpen(true);
    }


    const openImageModal = (imageUrl: string[], index: number = 0) => {
        setSelectedImage(imageUrl);
        setSelectedImageIndex(index);
        setModalVisible(true);
    };


    const postComment = async () => {
        try {
            Keyboard.dismiss()
            setInputDisable(true)
            const response = await axios.post(
                `https://friendszone.app/api/post/${item.id}/comment`,
                {
                    content: newComment,
                    userId: userData?.id,
                },
                {
                    headers: {
                        Authorization: `All ${userData?.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.status === 200) {
                setNewComment("")
                fetchComent()
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setInputDisable(false)
        }
    };

    const fetchComent = async () => {
        try {
            const response = await axios.get(
                `https://friendszone.app/api/post/${item.id}/comment`,
                {
                    headers: {
                        Authorization: `All ${userData?.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.status === 200) {
                setComment(response.data.data.comments)
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    return (
        <>
            <StyledView className="flex-1 bg-white dark:bg-neutral-900 h-screen">
                <StyledView
                    className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS == "ios" ? "mt-8" : ""} ${Platform.OS == "ios" ? "h-[60px]" : "h-[60px]"}`}
                >
                    <TouchableOpacity
                        className="absolute left-4"
                        onPress={() => navigation.goBack()}
                    >
                        <StyledIonicons name='chevron-back' size={25} className='dark:text-white'></StyledIonicons>
                    </TouchableOpacity>

                    <StyledText className="dark:text-white font-bold text-lg">Post</StyledText>
                </StyledView>

                <ScrollView>
                    <StyledView className="my-1" />
                    <StyledView className="w-full flex-row items-center justify-between">
                        <TouchableOpacity className="flex-1 flex-row left-0 shadow-sm" onPress={() => navigation.navigate('ProfileTab', { profileId: item.member.id })}>
                            <Image className="ml-3 rounded-full w-[40px] h-[40px]" source={item.member?.profileUrl ? { uri: item.member?.profileUrl } : GuestIcon} />
                            <StyledView className="pl-3 mt-2 flex-row">
                                <StyledText className="font-custom font-bold text-md dark:text-white">{item.member.username} </StyledText>
                                {item.member.verified == true ? (<StyledView className="-mt-1"><StyledIonicons name={'checkmark-done'} size={18} color={'#dd164f'} /></StyledView>) : <></>}
                                <StyledText className="font-custom text-md ml-1 text-gray-400 ">{formatTimeDifference(item.createdAt)}</StyledText>
                            </StyledView>
                        </TouchableOpacity>
                        <StyledView className="mr-3 flex-row items-center mb-2">
                            <StyledIonicons
                                name="ellipsis-horizontal"
                                size={22}
                                color="gray"
                                accessibilityLabel="Settings"
                                onPress={() => { BottomSheetShow(0), setPostAction(item.id) }}
                            />
                        </StyledView>
                    </StyledView>

                    <StyledView className="px-2 mb-[60px]">
                        <StyledText className="font-custom mt-3 dark:text-white">{item.content}</StyledText>
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
                                <StyledIonicons
                                    name="heart-outline"
                                    size={24}
                                    onPress={() => { }}
                                    className="text-red-500"
                                />
                                <StyledText className="font-custom text-black dark:text-white ml-1 text-lg">{item._count.likes}</StyledText>
                            </StyledView>


                            <StyledView className="flex-row justify-center mr-5 items-center">
                                <StyledIonicons
                                    name="chatbubble-outline"
                                    size={24}
                                    onPress={() => { }}
                                    className="text-black dark:text-white"
                                />
                                <StyledText className="font-custom text-black dark:text-white ml-1 text-lg">{commentList.length}</StyledText>
                            </StyledView>
                        </StyledView>

                        <StyledView className='relative justify-start mt-2'>
                            {
                                commentList.map((comment) => (
                                    <StyledView key={comment.id} className='flex-row justify-start border-t-[1px] py-2 border-gray-100 dark:border-neutral-800'>
                                        <StyledImage className='bg-gray-500 rounded-full w-[30px] h-[30px]'
                                            source={comment.accountType == "customer" ? comment.customer?.profileUrl ? { uri: comment.customer.profileUrl } : GuestIcon : comment.member?.profileUrl ? { uri: comment.member.profileUrl } : GuestIcon} />
                                        <StyledView className='px-2'>
                                            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { profileId: comment.accountType == "customer" ? comment.customer?.id as string : comment.member?.id as string})}>
                                                <StyledView className='flex-row'>
                                                    <StyledText className='font-custom font-bold dark:text-white'>{comment.accountType == "customer" ? comment.customer?.username : comment.member?.username}</StyledText>
                                                    <StyledText className='pl-2 text-gray-400 font-custom'>{formatTimeDifference(comment.createdAt.toString())}</StyledText>
                                                </StyledView>
                                            </TouchableOpacity>

                                            <StyledText className='flex-wrap text-gray-700 dark:text-gray-300 font-custom pr-6'>
                                                {comment.content}
                                            </StyledText>
                                        </StyledView>
                                        <StyledTouchableOpacity className='absolute right-2'>
                                            <StyledIonicons
                                                name="ellipsis-horizontal"
                                                size={18}
                                                color="gray"
                                                accessibilityLabel="Settings"
                                                onPress={() => { BottomSheetShowComment(), setCommantId("0") }}
                                            />
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                ))
                            }

                        </StyledView>
                    </StyledView>
                </ScrollView>

            </StyledView>
            <StyledView className='absolute bottom-0 bg-white dark:bg-neutral-800 w-full border-t-[1px] border-neutral-200 dark:border-neutral-800 px-2 py-2'>
                <StyledView className="w-full flex-row items-center justify-between">
                    <StyledView
                        className="flex-row bg-gray-300 dark:bg-neutral-600 items-center mr-3 pl-4 rounded-full w-full h-[40px]"
                    >
                        <StyledInput
                            className="font-custom text-black"
                            placeholder='แสดงความคิดเห็น'
                            value={newComment}
                            onChangeText={setNewComment}
                            editable={!inputDisable}
                        >
                        </StyledInput>
                    </StyledView>
                    <StyledTouchableOpacity className='absolute right-3'
                        onPress={postComment}>
                        <StyledIonicons
                            className={`${newComment.length > 0 ? 'text-black' : 'text-gray-500'}`}
                            name="send"
                            size={25}>

                        </StyledIonicons>
                    </StyledTouchableOpacity>
                </StyledView>
            </StyledView>

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
                        <StyledIonicons name="close" size={30} color="white" />
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
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#404040" : "#fff"
                }}
            >
                <BottomSheetView style={{ height: "100%" }}>
                    <StyledView className="flex-1">
                        <StyledView className="mt-5 bg-gray-100 dark:bg-neutral-800 rounded-lg mx-5">
                            <StyledView className="my-2 px-3 py-1">
                                <TouchableOpacity onPress={() => navigation.navigate("ProfileTab", { profileId: posts.find((p) => p.id == postAction)?.member.id ?? "" })} className="flex-row items-center">
                                    <StyledIonicons
                                        name="information-circle-outline"
                                        size={24}
                                        className="text-black dark:text-neutral-200"
                                    />
                                    <StyledText className="pl-2 text-lg font-custom dark:text-neutral-200">เกี่ยวกับบัญชีนี้</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                            <StyledView className="bg-gray-200 dark:bg-neutral-700 w-full h-[1px]" />
                            <StyledView className="my-2 px-3 py-1">
                                <TouchableOpacity onPress={() => navigation.navigate("Policy", {
                                    backPage: "FeedsTab",
                                })} className="flex-row items-center">
                                    <StyledIonicons
                                        name="lock-closed-outline"
                                        size={24}
                                        className="text-black dark:text-neutral-200"
                                    />
                                    <StyledText className="pl-2 text-lg font-custom dark:text-neutral-200">ความเป็นส่วนตัว</StyledText>
                                </TouchableOpacity>
                            </StyledView>

                            {
                                posts.some((p) => p.id === postAction && p.member.id === userData?.id) ? null :
                                    (
                                        <>
                                            <StyledView className="bg-gray-200 dark:bg-neutral-700 w-full h-[1px]" />
                                            <StyledView className="my-2 px-3 py-1">
                                                <TouchableOpacity onPress={() => { }} className="flex-row items-center">
                                                    <StyledIonicons
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
                                    <StyledView className="mt-4 bg-gray-100 dark:bg-neutral-800 rounded-lg mx-5">
                                        <StyledView className="my-2 px-3 py-1">
                                            <TouchableOpacity onPress={() => { handleGotoEditPost() }} className="flex-row items-center">
                                                <StyledIonicons
                                                    name="pencil-outline"
                                                    size={24}
                                                    className="text-black dark:text-neutral-200"
                                                />
                                                <StyledText className="pl-2 text-lg font-custom">แก้ไข</StyledText>
                                            </TouchableOpacity>
                                        </StyledView>
                                        <StyledView className="bg-gray-200 dark:bg-neutral-700 w-full h-[1px]" />
                                        <StyledView className="my-2 px-3 py-1">
                                            <TouchableOpacity onPress={() => deleteTwoStep(postAction)} className="flex-row items-center">
                                                <StyledIonicons
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

            <BottomSheet
                ref={bottomSheetRefComment}
                snapPoints={snapPointsComment}
                enablePanDownToClose={true}
                onClose={() => setIsOpen(false)}
                index={-1}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#404040" : "#fff"
                }}
            >
                <BottomSheetView style={{ height: "100%" }}>
                    <StyledView className="flex-1">
                        <StyledView className="mt-5 bg-gray-100 dark:bg-neutral-800 rounded-lg mx-5">
                            <StyledView className="my-2 px-3 py-1">
                                <TouchableOpacity onPress={() => deleteTwoStep(postAction)} className="flex-row items-center">
                                    <StyledIonicons
                                        name="trash-outline"
                                        size={24}
                                        color="#ff2525"
                                    />
                                    <StyledText className="text-[#ff2525] pl-2 text-lg font-custom">ลบความคิดเห็น</StyledText>
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
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