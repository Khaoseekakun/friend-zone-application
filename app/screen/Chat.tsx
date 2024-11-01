import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, TouchableOpacity, Platform, KeyboardAvoidingView,
    ActivityIndicator, Alert,
    Image
} from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { RootStackParamList } from "@/types";
import * as Notifications from 'expo-notifications';

const WhiteLogo = require("../../assets/images/logo-white.png")
// แก้ไข URL ให้ตรงกับ backend
const API_URL = "https://friendszone.app/api";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledTouchableOpacity = styled(TouchableOpacity);


// สร้าง axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

interface Message {
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

type PostUpdateParam = RouteProp<RootStackParamList, 'Chat'>;

export default function Chat() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList | null>(null);
    const [typing, setTyping] = useState(false);
    const router = useRoute<PostUpdateParam>();
    const { chatId, chatName, helper } = router.params;

    useEffect(() => {
        const checkNotificationPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
        };

        checkNotificationPermissions();
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        setIsLoading(true);
        try {
            // ทดลองใช้ข้อมูล dummy ก่อน
            const dummyMessages: Message[] = [
                {
                    id: '1',
                    text: 'สวัสดีครับ',
                    senderId: 'currentUserId',
                    timestamp: new Date().toISOString(),
                    status: 'read'
                },
                {
                    id: '2',
                    text: 'สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ',
                    senderId: 'other',
                    timestamp: new Date().toISOString(),
                    status: 'read'
                }
            ];
            setMessages(dummyMessages);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            Alert.alert(
                'Error',
                'ไม่สามารถโหลดประวัติการสนทนาได้ กรุณาลองใหม่อีกครั้ง',
                [
                    {
                        text: 'ลองใหม่',
                        onPress: fetchChatHistory
                    },
                    {
                        text: 'ยกเลิก',
                        style: 'cancel'
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            text: newMessage.trim(),
            chatId,
            timestamp: new Date().toISOString()
        };

        setIsSending(true);
        try {
            const newMsg: Message = {
                id: Date.now().toString(),
                text: messageData.text,
                senderId: 'currentUserId',
                timestamp: messageData.timestamp,
                status: 'sent'
            };
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
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

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === 'currentUserId';

        return (
            <>


                <StyledView className="items-center justify-center">
                    <StyledText
                        className={`text-gray-500 text-xs font-custom pb-1`}
                    >
                        {new Date(item.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </StyledText>
                </StyledView>

                <StyledView className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isMyMessage && (
                        <Image className="bg-[#EB3834] rounded-full w-[32px] h-[32px] mr-2 max-w-[80%]" source={WhiteLogo} />
                    )}
                    <StyledView
                        className={`${isMyMessage ? 'bg-[#EB3834]' : 'bg-gray-200'} rounded-2xl px-3 py-2 max-w-[80%] mb-3`}
                    >
                        <StyledText className={`${isMyMessage ? 'text-white' : 'text-black'} font-custom text-base `}>
                            {item.text}
                        </StyledText>
                    </StyledView>
                </StyledView>


            </>
        );
    };

    return (
        <StyledView className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}

            >

                <StyledView className="bg-white px-3 pt-[60px] pb-3 border-b border-gray-200">
                    <TouchableOpacity
                        onPress={() => navigation.navigate("MessageTab")}
                        className="absolute pt-[60] ml-4"
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <StyledView className="flex-row items-center justify-center">
                        <StyledText className="text-center font-bold text-lg">{chatName}</StyledText>
                    </StyledView>
                </StyledView>
                {isLoading ? (
                    <StyledView className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EB3834" />
                    </StyledView>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        className="flex-1 px-4 pt-2 mb-7"
                        onContentSizeChange={scrollToBottom}
                        onLayout={scrollToBottom}
                    />
                )}

                <StyledView className="flex-row px-2 z-10 items-center gap-2 relative py-2 bottom-5 bg-white w-full border-t max-h-[30%] border-gray-200">

                    <StyledView className="bg-blue-500 rounded-xl h-[36px] w-[36px] justify-center items-center">
                        <TouchableOpacity
                            onPress={() => { }}
                        >
                            <Ionicons
                                name="add"
                                size={24}
                                color={"white"}
                            />
                        </TouchableOpacity>
                    </StyledView>
                    <StyledView className="flex-row w-[85%] items-center min-h-[36px] bg-gray-100 rounded-lg px-4">
                        <StyledTextInput
                            placeholder="พิมพ์ข้อความ..."
                            className="flex-1 py-2 text-base"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                        />
                        {isSending ? (
                            <ActivityIndicator size="small" color="#EB3834" />
                        ) : (
                            <TouchableOpacity
                                onPress={sendMessage}
                                disabled={!newMessage.trim()}
                                className="-right-2"
                            >
                                <Ionicons
                                    name="send"
                                    size={24}
                                    color={newMessage.trim() ? "#EB3834" : "gray"}
                                />
                            </TouchableOpacity>
                        )}
                    </StyledView>
                </StyledView>

            </KeyboardAvoidingView>

        </StyledView>
    );
}