import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";

// Adjust the URL to your server’s address
const SERVER_URL = "http://49.231.43.37:3000/api/socketio";

const SocketClient = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [messages, setMessages] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        const socketConnection = io(SERVER_URL, {
            path: "/api/socketio",
            transports: ["websocket"],
        });

        setSocket(socketConnection);

        socketConnection.on("welcome", (msg) => {
            console.log("Welcome message:", msg);
        });

        socketConnection.on("message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socketConnection.disconnect();
            console.log("Socket disconnected");
        };
    }, []);

    const sendMessage = () => {
        if (socket) {
            console.log(socket)
            socket.emit("message", "Hello from React Native!");
        } else {
            console.log("Socket not connected")
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center" }}>

            <Button title="Back" onPress={() => navigation.goBack()} />
            <Button title="Send Message" onPress={sendMessage} />
            {messages.map((msg, index) => (
                <Text key={index}>{msg}</Text>
            ))}
        </View>
    );
};

export default SocketClient;

import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)

// export default function Message() {
//     const navigation = useNavigation<NavigationProp<any>>();
//     const [search, setSearch] = useState('');
//     const [searchloading, setSearchLoading] = useState(false);

//     const handlerMessageSearch = async() => {
//         setSearchLoading(true);
//         try {
//             const searchMessage = await axios.get(`http://49.231.43.37:3000/api/message`)
//         } catch (error) {

//         } finally {
//             setSearchLoading(false);
//         }
//     }




//     return (
//         <StyledView className="flex-1 bg-white">
//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             >
//                 <StyledView className="flex-1 bg-white">
//                     <StyledView className="bg-white px-3 text-center pt-[60px] pb-3">
//                         <TouchableOpacity onPress={() => navigation.goBack()} className="absolute pt-[60] ml-4">
//                             <Ionicons name="chevron-back" size={24} color="" />
//                         </TouchableOpacity>
//                         <StyledText className="text-center self-center text-lg font-bold text-black">Chats</StyledText>
//                     </StyledView>
//                     <StyledView className="w-full px-5 mt-2 h-full">
//                         <FlatList
//                             refreshing={true}
//                             onRefresh={() => { }}
//                             data={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]}
//                             keyExtractor={(item, index) => `${item.id}_${index}`}
//                             renderItem={({ item, index }) => (
//                                 <>
//                                     <TouchableOpacity onPress={() => navigation.navigate('Chat', { helper: true })} className="flex-row items-center justify-between p-3 rounded-lg">
//                                         <StyledView className="flex-row items-center">
//                                             <StyledView className="bg-gray-400 rounded-full w-[40px] h-[40px]" />
//                                             <StyledView className="ml-2">
//                                                 <StyledText className="font-bold">Friend Zone {index}</StyledText>
//                                                 <StyledText className="text-gray-500">สวัสดีครับ</StyledText>
//                                             </StyledView>
//                                         </StyledView>
//                                         <StyledText className="text-gray-500">12:00</StyledText>
//                                     </TouchableOpacity>
//                                 </>
//                             )}

//                             ListHeaderComponent={() => <>
//                                 <StyledView className="w-full px-2 mt-2">
//                                     <StyledTextInput
//                                         placeholder="ค้นหา"
//                                         className="py-2 w-full bg-gray-100 rounded-full text-lg pl-10 pr-9 placeholder-gray-500"
//                                         value={search}
//                                         onChangeText={setSearch}
//                                         inputMode='text'
//                                         maxLength={50}
//                                     >
//                                     </StyledTextInput>

//                                     <StyledIonIcon name="search" size={20} color="#9ca3af" className="pl-5 absolute mt-[10px]" />

//                                     {search.length > 0 && (
//                                         <StyledView className="right-5 absolute mt-[8px] bg-gray-50 rounded-full ">
//                                             <StyledIonIcon name="close" size={24} className="" color={""} onPress={() => setSearch('')} />
//                                         </StyledView>
//                                     )}
//                                 </StyledView>

//                                 <TouchableOpacity onPress={() => navigation.navigate('Chat', { helper: true })} className="flex-row items-center justify-between p-3 rounded-lg">
//                                     <StyledView className="flex-row items-center">
//                                         <StyledView className="bg-gray-400 rounded-full w-[40px] h-[40px]" />
//                                         <StyledView className="ml-2">
//                                             <StyledText className="font-bold">Friend Zone Helper</StyledText>
//                                             <StyledText className="text-gray-500">สวัสดีครับ</StyledText>
//                                         </StyledView>
//                                     </StyledView>
//                                     <StyledText className="text-gray-500">12:00</StyledText>
//                                 </TouchableOpacity>
//                             </>}

//                         />
//                     </StyledView>
//                 </StyledView>
//             </KeyboardAvoidingView>
//         </StyledView>
//     );
// }