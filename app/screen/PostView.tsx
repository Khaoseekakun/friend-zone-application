import { HeaderApp } from '@/components/Header'
import { Navigation } from '@/components/Navigation';
import { RootStackParamList } from '@/types';
import { formatTimeDifference } from '@/utils/Date';
import FireBaseApp from '@/utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { getStorage } from 'firebase/storage';
import { styled } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Appearance, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const GuestIcon = require("../../assets/images/guesticon.jpg")
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyleImageViewer = styled(ImageViewer);
const StyledIonicons = styled(Ionicons);
const storage = getStorage(FireBaseApp);

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
    member: {
        id: string;
        username: string;
        profileUrl: string;
        verified: boolean;
    }
}

type PostUpdateParam = RouteProp<RootStackParamList, 'PostView'>;
export default function PostView() {

    const route = useRoute<PostUpdateParam>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()

    const { item, backPage } = route.params;

    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState<UserProfile | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState([] as string[]);
    const [isOpen, setIsOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["35%"], []);
    const [userData, setuserData] = useState<any>();
    const [postAction, setPostAction] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const [theme, setTheme] = useState(Appearance.getColorScheme());

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
        fetchUserData();
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const userList = JSON.parse(userData);
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

    const openImageModal = (imageUrl: string[], index: number = 0) => {
        setSelectedImage(imageUrl);
        setSelectedImageIndex(index);
        setModalVisible(true);
    };


    return (
        <>
            <StyledView className="flex-1 bg-white dark:bg-neutral-900">
                <StyledView
                    className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS == "ios" ? "mt-8" : ""} ${Platform.OS == "ios" ? "h-[92px]" : "h-[60px]"}`}
                >
                    <TouchableOpacity
                        className="absolute left-4"
                        onPress={() => navigation.goBack()}
                    >
                        <StyledIonicons name='chevron-back' size={25} className='dark:text-white'></StyledIonicons>
                    </TouchableOpacity>

                    <StyledText className="dark:text-white font-bold text-lg">Post</StyledText>
                </StyledView>

                <StyledView >
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

                    <StyledView className="px-2">
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
                                <StyledText className="font-custom text-black dark:text-white ml-1 text-lg">0</StyledText>
                            </StyledView>


                            <StyledView className="flex-row justify-center mr-5 items-center">
                                <StyledIonicons
                                    name="chatbubble-outline"
                                    size={24}
                                    onPress={() => { }}
                                    className="text-black dark:text-white"
                                />
                                <StyledText className="font-custom text-black dark:text-white ml-1 text-lg">0</StyledText>
                            </StyledView>


                        </StyledView>
                    </StyledView>
                </StyledView>

                <StyledView className='absolute bottom-0 bg-white w-full border-t-[1px] border-gray-200 px-2 py-2'>
                    <StyledView className="w-full flex-row items-center justify-between">
                        <TouchableOpacity
                            className="flex-row bg-gray-300 items-center mr-3 pl-4 rounded-full w-full h-[40px]"
                        >
                            <StyledText className="text-gray-500 font-custom">แสดงความคิดเห็น</StyledText>
                        </TouchableOpacity>
                    </StyledView>
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