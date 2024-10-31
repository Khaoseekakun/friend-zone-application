import React, { useState, useEffect, useRef } from "react";
import { 
    View, Text, TouchableOpacity, Platform, KeyboardAvoidingView,
    ActivityIndicator, Alert
} from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { RootStackParamList } from "@/types";

// แก้ไข URL ให้ตรงกับ backend
const API_URL = "https://friendszone.app/api";
const SOCKET_URL = "https://friendszone.app/api/socketio";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);

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
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList | null>(null);
    
    const router = useRoute<PostUpdateParam>();
    const { chatId, chatName, helper } = router.params;

    useEffect(() => {
        initializeSocket();
        fetchChatHistory();
        return () => {
            socketRef.current?.disconnect();
        };
    }, [chatId]);

    const initializeSocket = () => {
        try {
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                query: {
                    chatId,
                    userId: 'currentUserId' // แทนที่ด้วย user ID จริง
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
            
            socketRef.current.on('message', (newMsg: Message) => {
                setMessages(prev => [...prev, newMsg]);
                scrollToBottom();
            });
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    };

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

            // เมื่อ API พร้อม ให้ใช้โค้ดนี้แทน
            /*
            const response = await api.get(`/chats/${chatId}/messages`);
            setMessages(response.data);
            */
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
            // ทดลองเพิ่มข้อความโดยตรง
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

            // เมื่อ API พร้อม ให้ใช้โค้ดนี้แทน
            /*
            const response = await api.post('/messages', messageData);
            socketRef.current?.emit('sendMessage', response.data);
            */
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
            <StyledView className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                {!isMyMessage && (
                    <StyledView className="bg-gray-400 rounded-full w-[30px] h-[30px] mr-2" />
                )}
                <StyledView 
                    className={`${isMyMessage ? 'bg-blue-500' : 'bg-gray-200'} 
                              rounded-2xl px-3 py-2 max-w-[80%]`}
                >
                    <StyledText className={`${isMyMessage ? 'text-white' : 'text-black'} text-base`}>
                        {item.text}
                    </StyledText>
                    <StyledView className="flex-row items-center justify-end mt-1">
                        <StyledText 
                            className={`${isMyMessage ? 'text-blue-100' : 'text-gray-500'} text-xs mr-1`}
                        >
                            {new Date(item.timestamp).toLocaleTimeString('th-TH', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </StyledText>
                        {isMyMessage && (
                            <StyledIonIcon 
                                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                                size={16} 
                                color={item.status === 'read' ? '#fff' : '#e0e0e0'}
                            />
                        )}
                    </StyledView>
                </StyledView>
            </StyledView>
        );
    };

    return (
        <StyledView className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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
                        <ActivityIndicator size="large" color="#0000ff" />
                    </StyledView>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        className="flex-1 px-4"
                        onContentSizeChange={scrollToBottom}
                        onLayout={scrollToBottom}
                    />
                )}

                <StyledView className="px-4 py-2 border-t border-gray-200">
                    <StyledView className="flex-row items-center bg-gray-100 rounded-full px-4">
                        <StyledTextInput
                            placeholder="พิมพ์ข้อความ..."
                            className="flex-1 py-2 text-base"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxHeight={100}
                        />
                        {isSending ? (
                            <ActivityIndicator size="small" color="#0000ff" />
                        ) : (
                            <TouchableOpacity 
                                onPress={sendMessage}
                                disabled={!newMessage.trim()}
                                className="ml-2"
                            >
                                <Ionicons 
                                    name="send" 
                                    size={24} 
                                    color={newMessage.trim() ? "#0000ff" : "gray"} 
                                />
                            </TouchableOpacity>
                        )}
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView>
        </StyledView>
    );
}