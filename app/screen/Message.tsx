import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView, Image, ActivityIndicator } from "react-native";
import { NavigationProp, useIsFocused, useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { RootStackParamList } from "@/types";
import { Navigation } from "@/components/Navigation";
import FireBaseApp from "@/utils/firebaseConfig";
import { equalTo, get, getDatabase, orderByChild, query, ref } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);

const AppLogo = require("../../assets/images/logo.png");
const GuestIcon = require("../../assets/images/guesticon.jpg");

export default function Message() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused()
    const [channels, setChannels] = useState<Channel[]>([]);
    const [userData, setUserData] = useState<any>({});
    const [receiverData, setReceiverData] = useState<any>({}); // State to store receiver data
    const isCustomer = userData.role === 'customer';

    interface Channel {
        channel_id: string;
        customer_id?: string;
        member_id?: string;
    }

    const loadReceiver = async (receiverId: string) => {
        try {
            const res = await axios.get(`https://friendszone.app/api/profile/${receiverId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `All ${userData?.token}`,
                }
            });

            if (res.data.status !== 200) return null;
            return res.data.data.profile || null;
        } catch (error) {
            console.error('Error loading receiver:', error);
            return null;
        }
    };

    // Fetch user data and channels
    const fetchUserData = async () => {
        const storedUserData = await AsyncStorage.getItem('userData');
        setUserData(JSON.parse(storedUserData || '{}'));
    };

    const fetchChannelsForUser = useCallback(async () => {
        setLoading(true);

        if (!userData || !userData.id) {
            setLoading(false);
            return;
        }

        const database = getDatabase(FireBaseApp, 'https://friendszone-d1e20-default-rtdb.asia-southeast1.firebasedatabase.app');
        const messagePath = '/channels';
        const channelsRef = ref(database, messagePath);

        const channelsQuery = query(
            channelsRef,
            orderByChild(isCustomer ? 'customer_id' : 'member_id'),
            equalTo(userData.id)
        );

        try {
            const snapshot = await get(channelsQuery);
            const data = snapshot.val() || {};
            const fetchedChannels = Object.keys(data).map((key) => ({ channel_id: key, ...data[key] }));
            setChannels(fetchedChannels);

            // Fetch receiver data for each channel
            const receivers = await Promise.all(fetchedChannels.map(async (channel) => {
                const receiverId = channel.customer_id === 'someCondition' ? channel.member_id : channel.customer_id;
                const receiver = await loadReceiver(receiverId);
                return { channel_id: channel.channel_id, receiver };
            }));

            // Map receiver data to channels
            const receiverDataMap = receivers.reduce((acc: { [key: string]: any }, { channel_id, receiver }) => {
                acc[channel_id] = receiver;
                return acc;
            }, {});
            setReceiverData(receiverDataMap);
        } catch (error) {
            console.error("Error fetching channels:", error);
        } finally {
            setLoading(false);
        }
    }, [userData, isCustomer]);

    useEffect(() => {
        (async() => {
            await fetchUserData();
            
        })()

        if (isFocused) {
            fetchChannelsForUser();
        }
    }, [isFocused]);

    const handleChannelPress = (item: Channel) => {
        const receiver = receiverData[item.channel_id];
        navigation.navigate('Chat', {
            chatId: item.channel_id,
            chatName: `${receiver.username}`,
            receiverId: item.customer_id,
            profileUrl: receiver.profileUrl,
        });
    };

    const renderItem = ({ item }: { item: Channel }) => {
        const receiver = receiverData[item.channel_id]; // Get receiver from state
        return (
            <TouchableOpacity onPress={() => handleChannelPress(item)} className="flex-row items-center justify-between p-3 rounded-lg" key={`${item.channel_id}`}>
                <StyledView className="flex-row items-center">
                    <Image
                        source={receiver.profileUrl ? { uri: receiver.profileUrl } : GuestIcon}
                        className="bg-gray-400 rounded-full w-[40px] h-[40px] border-[1px] border-gray-200"
                    />
                    <StyledView className="ml-2">
                        <StyledText className="font-bold font-custom">{receiver ? receiver.username : 'Unknown'}</StyledText>
                        <StyledText className="text-gray-500 dark:text-gray-200 font-custom">Last message preview here</StyledText>
                    </StyledView>
                </StyledView>
                <StyledText className="text-gray-500 dark:text-gray-200">12:00</StyledText>
            </TouchableOpacity>
        );
    };

    return (
        <StyledView className="flex-1 bg-white dark:bg-neutral-900">
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <StyledView className="flex-1 bg-white dark:bg-neutral-900">
                    <StyledView className="bg-white px-3 text-center pt-[60px] pb-3">
                        <StyledText className="text-center self-center text-lg font-bold text-black">Messages</StyledText>
                    </StyledView>
                    <StyledView className="w-full px-5 mt-2 h-full">
                        {loading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                refreshing={true}
                                onRefresh={fetchChannelsForUser}
                                data={channels}
                                keyExtractor={(item) => item.channel_id}
                                renderItem={renderItem}
                                ListHeaderComponent={() => (
                                    <>
                                        <StyledView className="w-full px-2 mt-2">
                                            <StyledTextInput
                                                placeholder="ค้นหา"
                                                className="py-2 w-full bg-gray-100 rounded-full text-lg pl-10 pr-9 placeholder-gray-500"
                                                value={search}
                                                onChangeText={setSearch}
                                                inputMode='text'
                                                maxLength={50}
                                            />
                                            <StyledIonIcon name="search" size={20} color="#9ca3af" className="pl-5 absolute mt-[10px]" />
                                            {search.length > 0 && (
                                                <StyledView className="right-5 absolute mt-[8px] bg-gray-50 rounded-full">
                                                    <StyledIonIcon name="close" size={24} color={""} onPress={() => setSearch('')} />
                                                </StyledView>
                                            )}
                                        </StyledView>

                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('Chat', { helper: true, chatId: "helper", chatName: "Friend Zone Helper" })}
                                            className="flex-row items-center justify-between p-3 rounded-lg"
                                        >
                                            <StyledView className="flex-row items-center">
                                                <Image source={AppLogo} className="bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                                <StyledView className="ml-2">
                                                    <StyledText className="font-bold">Friend Zone Helper</StyledText>
                                                    <StyledText className="text-gray-500">คุณ : สวัสดีครับ</StyledText>
                                                </StyledView>
                                            </StyledView>
                                            <StyledText className="text-gray-500">12:00</StyledText>
                                        </TouchableOpacity>
                                    </>
                                )}
                            />
                        )}
                    </StyledView>
                </StyledView>
            </KeyboardAvoidingView>
            <StyledView className="shadow-md">
                <Navigation current="MessageTab" />
            </StyledView>
        </StyledView>
    );
}
