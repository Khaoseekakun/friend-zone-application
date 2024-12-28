import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Alert, Image, Keyboard, Appearance, useColorScheme } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { equalTo, get, getDatabase, onValue, orderByChild, query, ref, set, limitToLast, startAt, push, serverTimestamp, update, endAt } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FireBaseApp from "@/utils/firebaseConfig";
import { RootStackParamList } from "@/types";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { addNotification } from "@/utils/Notification";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledIcon = styled(Ionicons);
const StyledIonicons = styled(Ionicons);
const Logo = require("../../assets/images/logo.png");
const GuestIcon = require("../../assets/images/guesticon.jpg");

const MESSAGE_LIMIT = 10;

export default function Chat() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    interface Message {
        id: string;
        text: string;
        senderId: string;
        timestamp: string;
        status: 'approve_work_customer' | 'approve_work_member' | 'timeout_customer' | 'timeout_member' | 'cancel_customer' | 'cancel_member' | 'working' | 'work_success' | 'reviewed' | 'sent';
        images: string[];
        details: {
            billingPrice: number;
            startTime: string;
            endTime: string;
            date: string;
            location: string;
            pin: {
                latitude: number;
                longtitude: number;
            };
            jobsType: string;
        };
        date: string;
        end_date: string;
        location: string;
        start_date: string;
        notificationState: 'ready_confirm' | 'cancel_confirm' | null;

    }

    interface Channel {
        channel_id: string;
        customer_id?: string;
        member_id?: string;
    }
    const [cooldown, setCooldown] = useState(parseInt((Date.now() / 1000).toFixed(0)));
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList | null>(null);
    type PostUpdateParam = RouteProp<RootStackParamList, 'Chat'>;
    const router = useRoute<PostUpdateParam>();
    const { chatId, receiverId, chatName, profileUrl, helper } = router.params;
    const [userData, setUserData] = useState<any>({});
    const [lastMessageKey, setLastMessageKey] = useState<string | null>(null);
    const database = getDatabase(FireBaseApp);
    const isCustomer = userData.role === 'customer';
    const [channels, setChannels] = useState<Channel[]>([]);
    const [channelId, setChatId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<Message | null>(null);

    const bottomSheetRefReview = useRef<BottomSheet>(null);
    const [reviewStars, setReviewStars] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [sendReviewLoading, setSendReviewLoading] = useState(false);

    const [theme, setTheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, [])

    const updateMessageState = (messageId: string, state: 'ready_confirm' | 'cancel_confirm' | null) => {
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === messageId) {
                return {
                    ...msg,
                    notificationState: state
                };
            }
            return msg;
        }));
    };


    const [inputFocus, setInputFocus] = useState(false);

    const sendPushNotification = async (receiverId: string, notify: {
        title: string;
        body: string;
        imageUrl: string;
    }) => {
        try {
            await axios.post('https://friendszone.app/api/notification/send', {
                title: notify.title,
                body: notify.body,
                imageUrl: notify.imageUrl,
                userId: receiverId,
                screen: {
                    name: 'Chat',
                    data: {
                        helper,
                        chatId,
                        receiverId: userData.id,
                        chatName: notify.title,
                        profileUrl: notify.imageUrl
                    }

                }
            }, {
                headers: {
                    'Authorization': `All ${userData?.token}`,
                    'Content-Type': "application/json"
                }
            })
        } catch (error) {

        }
    };

    const fetchChatHistory = async (loadOldMessage = false) => {
        setIsLoading(true);
        try {
            if (!chatId) {
                console.warn("No chatId provided. Cannot fetch chat history.");
                setIsLoading(false);
                return;
            }

            const messagesPath = `/channels/${chatId ?? channelId}/messages`;
            const messagesRef = ref(database, messagesPath);

            const queryConfig = loadOldMessage
                ? query(
                    messagesRef,
                    orderByChild("timestamp"),
                    endAt(messages[0].timestamp, "timestamp"),
                    limitToLast(MESSAGE_LIMIT + 1)
                )
                :
                query(messagesRef, orderByChild("timestamp"), limitToLast(MESSAGE_LIMIT));

            const snapshot = await get(queryConfig);
            if (snapshot.exists()) {
                const data = snapshot.val();

                const loadedMessages = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key]
                }));


                if (loadedMessages?.length > 0) {
                    const newLastMessageKey = loadedMessages[0].id;
                    if (newLastMessageKey !== lastMessageKey) {
                        setLastMessageKey(newLastMessageKey);
                    }
                }

                if (loadOldMessage) {
                    setMessages(prevMessages => {

                        const firstLoadedMessage = loadedMessages[0];
                        if (prevMessages?.length > 0 && prevMessages[0].id === firstLoadedMessage.id) {
                            loadedMessages.shift();
                        }
                        return [...loadedMessages, ...prevMessages];

                    });
                } else {
                    setMessages(prevMessages => [...prevMessages, ...loadedMessages]);
                }
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            Alert.alert('Error', 'ไม่สามารถโหลดประวัติการสนทนาได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
            if (loadOldMessage) {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserData = await AsyncStorage.getItem('userData');
            setUserData(JSON.parse(storedUserData || '{}'));
        };

        fetchUserData();

        if (!chatId && receiverId) {
            findOrCreateChannel();
        } else {
            fetchChatHistory();
        }
        const database = getDatabase(FireBaseApp);
        const messagesRef = ref(database, `/channels/${chatId ?? channelId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val() || {};
            const loadedMessages = Object.keys(data).map((key) => ({
                id: key,
                ...data[key]
            }));

            loadedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setMessages(loadedMessages);

            scrollToBottom();
        });

        return () => unsubscribe();
    }, [chatId, receiverId]);

    const loadOldMessage = async () => {
        if (cooldown > parseInt((Date.now() / 1000).toFixed(0))) return;
        if (lastMessageKey) {
            setRefreshing(true); // Show the spinner
            try {
                await fetchChatHistory(true); // Load older messages
            } finally {
                setRefreshing(false); // Hide the spinner after 
                setCooldown(parseInt((Date.now() / 1000).toFixed(0)) + 3);
            }
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            text: newMessage.trim(),
            senderId: userData.id,
            timestamp: serverTimestamp(),
            status: 'sent'
        };

        setIsSending(true);

        try {
            if (!chatId) {
                console.warn("No chatId available. Cannot send message.");
                setIsSending(false);
                return;
            }

            const database = getDatabase(FireBaseApp);
            const messagesRef = ref(database, `/channels/${chatId}/messages`);

            const newMessageRef = push(messagesRef);
            const updates: Record<string, any> = {};
            if (newMessageRef.key) {
                updates[`/channels/${chatId}/messages/${newMessageRef.key}`] = messageData;
            } else {
                console.error('Failed to generate a new message key.');
            }
            updates[`/channels/${chatId}/timestamp`] = serverTimestamp();
            await update(ref(database), updates);

            const createLastMessageRef = ref(database, `/channels/${chatId}/last_message`);
            await set(createLastMessageRef, {
                text: newMessage.trim(),
                senderId: userData.id,
                timestamp: serverTimestamp(),
                status: 'sent'
            });

            sendPushNotification(receiverId as string, {
                body: newMessage,
                imageUrl: userData?.profileUrl,
                title: userData?.username
            })

            setNewMessage('');
            scrollToBottom();


        } catch (error) {
            Alert.alert('Error', 'ไม่สามารถส่งข้อความได้ กรุณาลองใหม่');
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const findOrCreateChannel = useCallback(async () => {
        if (chatId) return setChatId(chatId);
        if (!receiverId || !userData?.id) return;

        await fetchChannelsForUser();

        const existingChannel = channels.find(channel =>
            channel.customer_id === receiverId || channel.member_id === receiverId
        );
        if (existingChannel) {
            setChatId(existingChannel.channel_id);
        } else {
            const newChannelId = await createChannel(userData.id, receiverId);
            if (newChannelId) {
                setChatId(newChannelId);
            } else {
                console.log("Error creating channel");
            }
        }
    }, [receiverId, userData, channels]);

    const fetchChannelsForUser = useCallback(async () => {
        if (!userData?.id) return;

        const channelsRef = ref(database, '/channels');
        const channelsQuery = query(
            channelsRef,
            orderByChild(isCustomer ? 'customer_id' : 'member_id'),
            equalTo(userData.id)
        );

        try {
            const snapshot = await get(channelsQuery);
            const data = snapshot.val() || {};
            const fetchedChannels = Object.keys(data).map((key) => ({
                channel_id: key,
                ...data[key]
            }));
            setChannels(fetchedChannels);
        } catch (error) {
            console.error("Error fetching channels:", error);
        }
    }, [userData, isCustomer]);

    const createChannel = async (customer_id: string, member_id: string) => {
        const channelId = `${customer_id}_${member_id}`;
        const newChannelRef = ref(database, `/channels/${channelId}`);

        const channelData = {
            customer_id,
            member_id,
            messages: []
        };

        try {
            await set(newChannelRef, channelData);
            return channelId;
        } catch (error) {
            return null;
        }
    };

    const firebaseUpdateSchedule = (channelId: string, message: Message, status: 'approve_work_customer' | 'approve_work_member' | 'timeout_customer' | 'timeout_member' | 'cancel_customer' | 'cancel_member' | 'working' | 'work_success' | 'reviewed') => {
        const updateRef = ref(database, `/channels/${channelId}/messages/${message.id}`);
        update(updateRef, {
            status
        });
    }

    const sendReview = async (
        message : Message
    ) => {
        if (!reviewText) {
            return Alert.alert('ข้อมูลไม่ครบ', 'โปรดกรอกข้อมูลให้ครบถ้วน', [{ text: 'OK' }]);
        }

        try {
            setSendReviewLoading(true);
            const response = await axios.post(`https://friendszone.app/api/profile/${userData.id}/review`, {
                userId: userData.id,
                star: reviewStars,
                text: reviewText
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `All ${userData.token}`
                }
            });

            if (response.data.status != 200) {
                Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรีวิวได้', [{ text: 'OK' }]);
            } else {
                
                bottomSheetRefReview.current?.close()
                firebaseUpdateSchedule(chatId as string, message, 'reviewed');
                addNotification(userData.id, {
                    content: `${userData.username} ได้รีวิวคุณ`,
                    data: {},
                    timestamp: `${new Date().toISOString()}`,
                    type: "review",
                    user: {
                        id: userData.id,
                        name: userData.username,
                        avatar: userData.profileUrl
                    },
                    isRead: false
                })
                setReviewStars(0);
                setReviewText('');
            }

        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรีวิวได้', [{ text: 'OK' }]);
        } finally {
            setSendReviewLoading(false);
        }
    }

    const buttonScheduleRender = (
        item: Message,) => {
        if (item.status === 'approve_work_customer') {
            if (userData.role === 'customer') {
                return (
                    <StyledView className="flex-row space-x-2">
                        <TouchableOpacity
                            className="flex-1"
                            onPress={() => {
                                if (item.notificationState === 'ready_confirm') {
                                    updateMessageState(item.id, null);
                                    if (chatId) return firebaseUpdateSchedule(chatId as string, item, 'working');
                                } else if (item.notificationState === 'cancel_confirm') {
                                    if (chatId) return firebaseUpdateSchedule(chatId as string, item, 'cancel_customer');
                                    updateMessageState(item.id, null);
                                } else {
                                    updateMessageState(item.id, 'ready_confirm');
                                }
                            }}
                        >
                            <LinearGradient
                                colors={useColorScheme() === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-3 rounded-full"
                            >
                                <StyledText className="font-custom text-white text-center">
                                    {item.notificationState ? 'ยืนยัน' : 'พร้อมแล้ว'}
                                </StyledText>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1"
                            onPress={() => {
                                if (item.notificationState) {
                                    updateMessageState(item.id, null);
                                } else {
                                    updateMessageState(item.id, 'cancel_confirm');
                                }
                            }}
                        >
                            <StyledView className="bg-gray-200 dark:bg-neutral-700 py-3 rounded-full">
                                <StyledText className="font-custom text-gray-700 dark:text-gray-300 text-center">
                                    {item.notificationState ? 'ย้อนกลับ' : 'ยกเลิก'}
                                </StyledText>
                            </StyledView>
                        </TouchableOpacity>
                    </StyledView>
                )
            } else {
                return (
                    <StyledView className="flex-row justify-center">
                        <StyledText className="text-white font-custom">
                            รอการยืนยันจาก {chatName}
                        </StyledText>
                    </StyledView>
                )
            }
        }

        if (item.status === 'approve_work_member') {
            if (userData.role === 'member') {
                return (
                    <>
                        <TouchableOpacity
                            className="flex-1"
                            onPress={() => {
                                if (item.notificationState === 'ready_confirm') {
                                    updateMessageState(item.id, null);
                                    if (chatId) return firebaseUpdateSchedule(chatId as string, item, 'approve_work_customer');

                                } else if (item.notificationState === 'cancel_confirm') {
                                    updateMessageState(item.id, null);
                                    if (chatId) return firebaseUpdateSchedule(chatId as string, item, 'cancel_member');
                                } else {
                                    updateMessageState(item.id, 'ready_confirm');
                                }
                            }}
                        >
                            <LinearGradient
                                colors={useColorScheme() === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-3 rounded-full"
                            >
                                <StyledText className="font-custom text-white text-center">
                                    {item.notificationState ? 'ยืนยัน' : 'พร้อมแล้ว'}
                                </StyledText>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1"
                            onPress={() => {
                                if (item.notificationState) {
                                    updateMessageState(item.id, null);
                                } else {
                                    updateMessageState(item.id, 'cancel_confirm');
                                }
                            }}
                        >
                            <StyledView className="bg-gray-200 dark:bg-neutral-700 py-3 rounded-full">
                                <StyledText className="font-custom text-gray-700 dark:text-gray-300 text-center">
                                    {item.notificationState ? 'ย้อนกลับ' : 'ยกเลิก'}
                                </StyledText>
                            </StyledView>
                        </TouchableOpacity>
                    </>
                )
            } else {
                return (
                    <StyledView className="flex-row justify-center">
                        <StyledText className="text-white font-custom">
                            รอการยืนยันจาก {chatName}
                        </StyledText>
                    </StyledView>
                )
            }
        }

        if (item.status === 'timeout_customer' || item.status === 'timeout_member') {
            return (
                <StyledView className="flex-row justify-center">
                    <StyledText className="text-white font-custom">
                        งานนี้ถูกยกเลิกโดยอัตโนมัติเนื่องจาก {(item.status === 'timeout_customer' ? userData.role == "customer" ? 'คุณ' : chatName : null)} {(item.status === 'timeout_member' ? userData.role == "member" ? 'คุณ' : chatName : null)}ตอบกลับช้าเกิน 20 นาที
                    </StyledText>
                </StyledView>
            )
        }

        if (item.status === "work_success" && userData.role !== 'customer') {
            return (
                <TouchableOpacity
                    className="flex-1"
                    onPress={() => {
                        setReviewMessage(item)
                        bottomSheetRefReview.current?.expand();
                    }}
                >
                    <LinearGradient
                        colors={useColorScheme() === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-3 rounded-full"
                    >
                        <StyledText className="font-custom text-white text-center">
                            รีวิวงานครั้งนี้
                        </StyledText>
                    </LinearGradient>
                </TouchableOpacity>
            )
        }
    }


    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isMyMessage = item.senderId === userData.id;

        const showTimestamp = (() => {
            if (index === 0) return true;
            const prevMessageTime = new Date(messages[index - 1].timestamp);
            const currentMessageTime = new Date(item.timestamp);
            return (currentMessageTime.getTime() - prevMessageTime.getTime()) > 10 * 60 * 1000;
        })();

        return (
            <>

                {showTimestamp && (
                    <StyledView className="items-center justify-center mt-1">
                        <StyledText className="text-gray-500 text-xs font-custom pb-1">
                            {new Date(item.timestamp).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </StyledText>
                    </StyledView>
                )}

                {item.senderId == "system" ? (
                    <StyledView className={`flex-row justify-center`}>
                        <StyledView className={`${isMyMessage ? 'bg-[#EB3834]' : ''} rounded-xl px-3 py-2 max-w-[90%] mb-3 border-neutral-500 bg-white dark:bg-neutral-800 border-dashed border-[1px] w-full`}>
                            <StyledText className={`${isMyMessage ? 'text-white' : 'text-black dark:text-white'} font-custom text-2xl text-center`}>
                                ฿ {(item.details.billingPrice / 100).toLocaleString()}
                            </StyledText>
                            <StyledView className="my-1 border-t-[1px] border-neutral-700 pt-3">
                                <StyledView className="flex-row justify-between items-center">
                                    <StyledText className={`text-black dark:text-gray-300 font-custom text-base`}>
                                        วันที่นัดหมาย
                                    </StyledText>
                                    <StyledText className={`text-black dark:text-white font-custom text-base`}>
                                        {new Date(item.details.date).toLocaleDateString('th-TH', {})}
                                    </StyledText>
                                </StyledView>

                                <StyledView className="flex-row justify-between items-center">
                                    <StyledText className={`text-black dark:text-gray-300 font-custom text-base`}>
                                        เวลาเริ่ม
                                    </StyledText>
                                    <StyledText className={`text-black dark:text-white font-custom text-base`}>
                                        {new Date(item.details.startTime).toLocaleDateString('th-TH', {})} {new Date(item.details.startTime).getHours()} {new Date(item.details.startTime).getMinutes() > 0 ? `: ${new Date(item.details.startTime).getMinutes()}` : '00'}
                                    </StyledText>
                                </StyledView>
                                <StyledView className="flex-row justify-between items-center ">
                                    <StyledText className={`text-black dark:text-gray-300 font-custom text-base`}>
                                        เวลาสิ้นสุด
                                    </StyledText>
                                    <StyledText className={`text-black dark:text-white font-custom text-base`}>
                                        {new Date(item.details.endTime).toLocaleDateString('th-TH', {})} {new Date(item.details.endTime).getHours()} {new Date(item.details.endTime).getMinutes() > 0 ? `: ${new Date(item.details.endTime).getMinutes()}` : '00'}
                                    </StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView className="mt-2  border-t-[1px] border-neutral-700 pt-1">
                                <StyledTouchableOpacity>
                                    <StyledText className={`text-black dark:text-gray-300 font-custom text-base`}>
                                        สถานที่ (คลิกเพื่อเปิด)
                                    </StyledText>
                                    <StyledText className={`text-black dark:text-white font-custom text-base warp`}>
                                        - {item.details.location}
                                    </StyledText>
                                </StyledTouchableOpacity>
                            </StyledView>
                            <StyledView className="mt-2  border-t-[1px] border-neutral-700 pt-1">
                                <StyledView className="flex-row justify-between items-center ">
                                    <StyledText className={`text-black dark:text-neutral-500 font-custom text-sm`}>
                                        ref
                                    </StyledText>
                                    <StyledText className={`text-black dark:text-neutral-500 font-custom text-sm`}>
                                        {item.id}
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                ) : item.senderId == "noti_schedules" ? (
                    <StyledView className="flex-row justify-center my-2">
                        <StyledView className="w-[90%] rounded-xl bg-red-50 dark:bg-neutral-800 border border-red-200 dark:border-neutral-700 overflow-hidden">
                            {/* Header Section - Remains constant */}
                            <StyledView className="flex-row items-center p-4 border-b border-red-200 dark:border-neutral-700">
                                <StyledView className="w-10 h-10 rounded-full bg-red-100 dark:bg-neutral-700 items-center justify-center mr-3">
                                    <StyledIonicons name="notifications-outline" size={24} color="#EB3834" />
                                </StyledView>
                                <StyledView className="flex-1">
                                    <StyledText className="font-custom text-lg text-red-600 dark:text-red-400">
                                        แจ้งเตือนการนัดหมาย
                                    </StyledText>
                                    <StyledText className="font-custom text-sm text-gray-600 dark:text-gray-400">
                                        {
                                            // countdown time schdule
                                            (new Date(item.date).getTime() - new Date().getTime()) > 0 ? (
                                                <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                    การนัดหมายจะเริ่มใน {Math.floor((new Date(item.date).getTime() - new Date().getTime()) / 1000 / 60)} นาที
                                                </StyledText>
                                            ) : (
                                                <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                    {
                                                        item.status === "approve_work_member" ? userData.role == "member" ? (
                                                            <StyledText className="font-custom text-sm text-yellow-600 dark:text-yellow-400">
                                                                คุณตอบกลับช้าเหลือเวลาอีก {Math.floor((new Date(item.date).getTime() + 20 * 60 * 1000 - new Date().getTime()) / 1000 / 60)} นาที
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-yellow-600 dark:text-yellow-400">
                                                                {chatName} ตอบกลับช้าเหลือเวลาอีก {Math.floor((new Date(item.date).getTime() + 20 * 60 * 1000 - new Date().getTime()) / 1000 / 60)} นาที
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "approve_work_customer" ? userData.role == "customer" ? (
                                                            <StyledText className="font-custom text-sm text-yellow-600 dark:text-yellow-400">
                                                                คุณตอบกลับช้าเหลือเวลาอีก {Math.floor((new Date(item.date).getTime() + 20 * 60 * 1000 - new Date().getTime()) / 1000 / 60)} นาที
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-yellow-600 dark:text-yellow-400">
                                                                {chatName} ตอบกลับช้าเหลือเวลาอีก {Math.floor((new Date(item.date).getTime() + 20 * 60 * 1000 - new Date().getTime()) / 1000 / 60)} นาที
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "timeout_customer" ? userData.role == "customer" ? (
                                                            <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                                คุณตอบกลับช้าเกิน 20 นาที
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                                {chatName} ตอบกลับช้าเกิน 20 นาที
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "timeout_member" ? userData.role == "member" ? (
                                                            <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                                คุณตอบกลับช้าเกิน 20 นาที
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-red-600 dark:text-red-400">
                                                                {chatName} ตอบกลับช้าเกิน 20 นาที
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "cancel_customer" ? userData.role == "customer" ? (
                                                            <StyledText className="font-custom text-sm text-gray-600 dark:text-gray-400">
                                                                คุณยกเลิกการนัดหมาย
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-gray-600 dark:text-gray-400">
                                                                {chatName} ยกเลิกการนัดหมาย
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "cancel_member" ? userData.role == "member" ? (
                                                            <StyledText className="font-custom text-sm text-gray-600 dark:text-gray-400">
                                                                คุณยกเลิกการนัดหมาย
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-gray-600 dark:text-gray-400">
                                                                {chatName} ยกเลิกการนัดหมาย
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "work_success" ? (
                                                            <StyledText className="font-custom text-sm text-green-600 dark:text-green-400">
                                                                งานเสร็จสิ้น
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "reviewed" ? userData.role == "member" ? (
                                                            <StyledText className="font-custom text-sm text-orange-600 dark:text-orange-200">
                                                                {chatName} ได้รีวิวงานให้คุณแล้ว
                                                            </StyledText>
                                                        ) : (
                                                            <StyledText className="font-custom text-sm text-orange-600 dark:text-orange-200">
                                                                คุณได้รีวิวงานี้แล้ว
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                    {
                                                        item.status === "working" ? (
                                                            <StyledText className="font-custom text-sm text-orange-600 dark:text-orange-400">
                                                                งานกำลังดำเนินการ
                                                            </StyledText>
                                                        ) : null
                                                    }

                                                </StyledText>
                                            )
                                        }
                                    </StyledText>
                                </StyledView>
                            </StyledView>

                            {/* Dynamic Content Section */}
                            <StyledView className="p-4">
                                {item.notificationState === 'ready_confirm' ? (
                                    <StyledText className="font-custom text-sm text-gray-800 dark:text-gray-200 text-center mb-4">
                                        คุณแน่ใจหรือไม่ว่าพร้อมสำหรับการนัดหมายนี้?
                                    </StyledText>
                                ) : item.notificationState === 'cancel_confirm' ? (
                                    <StyledText className="font-custom text-sm text-gray-800 dark:text-gray-200 text-center mb-4">
                                        คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?
                                    </StyledText>
                                ) : (
                                    <>
                                        <StyledText className="font-custom text-base text-gray-800 dark:text-gray-200 mb-3">
                                            {item.text}
                                        </StyledText>

                                        <StyledView className="bg-white dark:bg-neutral-900 rounded-lg p-3 mb-4">
                                            <StyledView className="flex-row items-center mb-2">
                                                <StyledIonicons name="calendar-outline" size={20} color="#666" />
                                                <StyledText className="font-custom text-gray-700 dark:text-gray-300 ml-2">
                                                    {new Date(item.date || '').toLocaleDateString('th-TH')}
                                                </StyledText>
                                            </StyledView>

                                            <StyledView className="flex-row items-center mb-2">
                                                <StyledIonicons name="time-outline" size={20} color="#666" />
                                                <StyledText className="font-custom text-gray-700 dark:text-gray-300 ml-2">
                                                    {new Date(item.start_date || '').toLocaleTimeString('th-TH', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    {' - '}
                                                    {new Date(item.end_date || '').toLocaleTimeString('th-TH', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </StyledText>
                                            </StyledView>

                                            <StyledView className="flex-row items-center">
                                                <StyledIonicons name="location-outline" size={20} color="#666" />
                                                <StyledText className="font-custom text-gray-700 dark:text-gray-300 ml-2 flex-1">
                                                    {item.location}
                                                </StyledText>
                                            </StyledView>
                                        </StyledView>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <StyledView className="flex-row justify-between space-x-3">
                                    {
                                        buttonScheduleRender(item)
                                    }
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </StyledView>
                ) : (
                    <StyledView className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        {/* Existing regular message content */}
                        {!isMyMessage && (
                            <StyledImage
                                className="rounded-full w-[32px] h-[32px] mr-2"
                                source={isMyMessage ? Logo : profileUrl ? { uri: profileUrl } : GuestIcon}
                            />
                        )}
                        <StyledView className={`${isMyMessage ? 'bg-[#EB3834]' : 'bg-gray-200'} rounded-2xl px-3 py-2 max-w-[80%] mb-3`}>
                            <StyledText className={`${isMyMessage ? 'text-white' : 'text-black'} font-custom text-base`}>
                                {item.text}
                            </StyledText>
                        </StyledView>
                    </StyledView>
                )}

            </>
        );
    };



    return (
        <StyledView className="flex-1 bg-gray-50 dark:bg-neutral-900">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StyledView className={`text-center top-0 ${Platform.OS == "ios" ? "h-[92px]" : "h-[92px]"} bg-white dark:bg-neutral-900 justify-center border-b-[1px] pt-3 border-gray-200 dark:border-neutral-800`}>
                    <TouchableOpacity onPress={() => navigation.navigate("MessageTab", {})} className="absolute ml-4 pt-5">
                        <StyledIcon name="chevron-back" size={24} className="text-black dark:text-white" />
                    </TouchableOpacity>
                    <StyledText className="text-center self-center text-lg font-custom text-black dark:text-white pt-5">{chatName}</StyledText>
                </StyledView>
                {isLoading && !refreshing ? (
                    <StyledView className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EB3834" />
                    </StyledView>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item, index) => `${item.id}_${index}`}
                        onRefresh={loadOldMessage} // Triggered when pulling to refresh at the top
                        refreshing={refreshing}    // Controls the spinner
                        ListHeaderComponent={
                            refreshing ? <ActivityIndicator size="small" color="gray" /> : null
                        }
                        onScroll={({ nativeEvent }) => {
                            const offsetY = nativeEvent.contentOffset.y;

                            if (offsetY <= -5 && !refreshing) {
                                loadOldMessage(); // Load older messages
                            }
                        }}
                        scrollEventThrottle={200} // Controls how often the `onScroll` event is fired (in ms)
                        onEndReachedThreshold={0.5} // Optional, but will be triggered once the user reaches the bottom
                        style={{
                            paddingHorizontal: 10,
                        }}

                    />
                )}

                <StyledView className="self-center max-h-[120px] px-2 items-center justify-center py-3 w-full border-t border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 ">
                    <StyledView className="w-full max-h-[120px] bg-neutral-200 dark:bg-neutral-800 rounded-3xl mb-3"
                    >
                        <StyledTextInput
                            multiline
                            className={`w-full px-4 font-custom ${inputFocus ? "max-h-[120px]" : "max-h-[50px]"} dark:text-white py-3 pr-[50px] dark:placeholder-white`}
                            onChangeText={(text) => {
                                setNewMessage(text);
                                setInputFocus(true);
                            }}
                            placeholder="พิมพ์ข้อความ..."
                            placeholderTextColor="#9CA3AF"
                            value={newMessage}
                            onPress={() => setInputFocus(true)}
                        >

                        </StyledTextInput>
                        {
                            newMessage?.length > 0 ? (
                                <StyledView className="absolute right-0 h-[45px] w-[45px] bottom-0">
                                    <StyledTouchableOpacity
                                        onPress={sendMessage}
                                    >
                                        <StyledView className="w-full h-full rounded-full items-center justify-center flex-row">
                                            <StyledIcon name="send" size={30} className="self-center mr-2 text-dark dark:text-white">

                                            </StyledIcon>
                                        </StyledView>
                                    </StyledTouchableOpacity>
                                </StyledView>
                            ) : (
                                <></>
                                // <StyledView className="absolute right-4 h-[45px] w-[90px]">
                                //     <StyledView className="w-full h-full rounded-full items-center justify-center flex-row">

                                //         <StyledIcon name="mic-outline" size={30} className="self-center mr-2 text-dark dark:text-white">

                                //         </StyledIcon>

                                //         <StyledIcon name="image-outline" size={30} className="self-center mr-2 text-dark dark:text-white">

                                //         </StyledIcon>
                                //         <StyledIcon name="camera-outline" size={30} className="self-center mr-2 text-dark dark:text-white">

                                //         </StyledIcon>
                                //     </StyledView>
                                // </StyledView>
                            )
                        }
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView >
            <BottomSheet
                ref={bottomSheetRefReview}
                snapPoints={["70%"]}
                enablePanDownToClose={true}
                index={-1}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#262626" : "#fff"
                }}
            >
                <BottomSheetView style={{ height: "80%" }}>
                    <TouchableWithoutFeedback
                        touchSoundDisabled={true}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    >
                        <StyledView className="flex-1justify-end">
                            <StyledView className=" rounded-t-3xl px-6">
                                <StyledView className="flex-row items-center justify-between mb-6">
                                    <StyledText className="text-2xl text-black dark:text-white font-custom">
                                        เขียนรีวิว
                                    </StyledText>
                                    <TouchableOpacity onPress={
                                        () => bottomSheetRefReview.current?.close()
                                    }>
                                        <StyledIonicons
                                            name="close"
                                            size={24}
                                            className="text-gray-400"
                                        />
                                    </TouchableOpacity>
                                </StyledView>

                                <StyledView className="items-center mb-8">
                                    <StyledText className="text-base text-gray-600 dark:text-gray-300 font-custom mb-4">
                                        ให้คะแนนประสบการณ์ของคุณ
                                    </StyledText>
                                    <StyledView className="flex-row">
                                        {[1, 2, 3, 4, 5]?.map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setReviewStars(star)}
                                                className="mx-2"
                                            >
                                                <StyledIonicons
                                                    name="star"
                                                    size={32}
                                                    color={
                                                        reviewStars >= star ? "#FFD700" : "#D3D3D3"
                                                    }
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </StyledView>
                                </StyledView>

                                <StyledView className="mb-8">
                                    <StyledText className="text-base text-gray-600 dark:text-gray-300 font-custom mb-2">
                                        เขียนความคิดเห็นของคุณ
                                    </StyledText>
                                    <StyledView className="bg-gray-50 dark:bg-neutral-700 rounded-2xl p-4">
                                        <TextInput
                                            multiline
                                            numberOfLines={5}
                                            value={reviewText}
                                            onChangeText={setReviewText}
                                            placeholder="แชร์ประสบการณ์ของคุณ..."
                                            placeholderTextColor="#9CA3AF"
                                            className="font-custom text-gray-700 dark:text-gray-200 min-h-[120px]"
                                            textAlignVertical="top"
                                        />
                                    </StyledView>
                                </StyledView>

                                {/* ปุ่มส่งรีวิว */}
                                <TouchableOpacity
                                    disabled={sendReviewLoading}
                                    onPress={() => {
                                        if (reviewStars && reviewText) {
                                            if(reviewMessage){
                                                sendReview(reviewMessage);
                                            }else{
                                                Alert.alert('ข้อมูลไม่ครบ', 'โปรดลองใหมอีกครั้ง', [{ text: 'OK' }]);
                                            }
                                        } else {
                                            Alert.alert("ข้อมูลไม่ครบ", "โปรดกรอกข้อมูลให้ครบถ้วน", [{ text: "OK" }]);
                                        }
                                    }}
                                >
                                    <LinearGradient
                                        colors={useColorScheme() === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="rounded-full py-4"
                                    >
                                        <StyledText className="text-white text-center text-lg font-custom">
                                            {
                                                isLoading ? <ActivityIndicator size="small" color="#fff" /> : "ส่ง"
                                            }
                                        </StyledText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </StyledView>
                        </StyledView>
                    </TouchableWithoutFeedback>
                </BottomSheetView>
            </BottomSheet>

        </StyledView >
    );
}