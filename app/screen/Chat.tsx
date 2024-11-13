import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Alert, Image } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import * as Notifications from 'expo-notifications';
import { equalTo, get, getDatabase, onValue, orderByChild, query, ref, set, limitToLast, startAt, push, serverTimestamp, update, endAt } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FireBaseApp from "@/utils/firebaseConfig";
import { RootStackParamList } from "@/types";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const Logo = require("../../assets/images/logo.png");
const GuestIcon = require("../../assets/images/guesticon.jpg");

const MESSAGE_LIMIT = 20;

export default function Chat() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    interface Message {
        id: string;
        text: string;
        senderId: string;
        timestamp: string;
        status: string;
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
    const { chatId, receiverId, chatName, profileUrl } = router.params;
    const [userData, setUserData] = useState<any>({});
    const [lastMessageKey, setLastMessageKey] = useState<string | null>(null);
    const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');
    const isCustomer = userData.role === 'customer';
    const [channels, setChannels] = useState<Channel[]>([]);
    const [channelId, setChatId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

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

            // Define the query for loading messages
            const queryConfig = loadOldMessage
                ? query(
                    messagesRef,
                    orderByChild("timestamp"),
                    endAt(messages[0].timestamp, "timestamp"), // Load messages older than the first message
                    limitToLast(MESSAGE_LIMIT + 1) // Get the number of older messages
                )
                : // load last 10 messages
                query(
                    messagesRef,
                    orderByChild("timestamp"),
                    endAt((Date.now() / 1000).toFixed(0), "timestamp"), // Load messages older than the first message
                    limitToLast(MESSAGE_LIMIT)
                );

            const snapshot = await get(queryConfig);
            if (snapshot.exists()) {
                const data = snapshot.val();

                const loadedMessages = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key]
                }));


                if (loadedMessages.length > 0) {
                    const newLastMessageKey = loadedMessages[0].id;
                    if (newLastMessageKey !== lastMessageKey) {
                        setLastMessageKey(newLastMessageKey);
                    }
                }

                if (loadOldMessage) {
                    setMessages(prevMessages => {
                        const firstLoadedMessage = loadedMessages[0];
                        if (prevMessages.length > 0 && prevMessages[0].id === firstLoadedMessage.id) {
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

        const checkNotificationPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();

            const token = (await Notifications.getExpoPushTokenAsync()).data;
        };

        checkNotificationPermissions();

        if (!chatId && receiverId) {
            findOrCreateChannel();
        } else {
            fetchChatHistory();
        }
        const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');
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

        // Clean up the listener when the component unmounts
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
            timestamp: serverTimestamp(), // Use serverTimestamp for accurate time
            status: 'sent'
        };

        setIsSending(true);

        try {
            if (!chatId) {
                console.warn("No chatId available. Cannot send message.");
                setIsSending(false);
                return;
            }

            const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');
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

    // Helper function to fetch channels for the user
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

    // Function to create a new channel in Firebase
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

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isMyMessage = item.senderId === userData.id;

        const showTimestamp = (() => {
            if (index === 0) return true;
            const prevMessageTime = new Date(messages[index - 1].timestamp);
            const currentMessageTime = new Date(item.timestamp);
            return (currentMessageTime.getTime() - prevMessageTime.getTime()) > 10 * 60 * 3000;
        })();

        return (
            <>
                {showTimestamp && (
                    <StyledView className="items-center justify-center">
                        <StyledText className="text-gray-500 text-xs font-custom pb-1">
                            {new Date(item.timestamp).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </StyledText>
                    </StyledView>
                )}

                <StyledView className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
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
            </>
        );
    };



    return (
        <StyledView className="flex-1 bg-white">
            <StyledView className="bg-white px-3 text-center pt-[60px] pb-3">
                <TouchableOpacity onPress={() => navigation.navigate("MessageTab", {})} className="absolute pt-[60] ml-4">
                    <Ionicons name="chevron-back" size={24} color="" />
                </TouchableOpacity>
                <StyledText className="text-center self-center text-lg font-bold text-black">{chatName}</StyledText>
            </StyledView>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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

                <StyledView className="self-center px-2 items-center gap-2 relative py-2 w-full border-t border-gray-200">
                    <StyledView className="flex-row w-full items-center min-h-[36px] bg-gray-100 rounded-lg px-4 mb-6">
                        <StyledTextInput
                            placeholder="พิมพ์ข้อความ..."
                            className="flex-1 py-2 text-base"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            onFocus={scrollToBottom}
                        />
                        {isSending ? (
                            <ActivityIndicator size="small" color="#EB3834" />
                        ) : (
                            <TouchableOpacity onPress={sendMessage} disabled={!newMessage.trim()} className="-right-2">
                                <Ionicons name="send" size={24} color={newMessage.trim() ? "#EB3834" : "gray"} />
                            </TouchableOpacity>
                        )}
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView>

        </StyledView>
    );
}



