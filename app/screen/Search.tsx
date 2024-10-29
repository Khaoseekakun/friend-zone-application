import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { RootStackParamList } from "@/types";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons)

type SearchParam = RouteProp<RootStackParamList, 'Search'>;
export default function Search() {
    const router = useRoute<SearchParam>();
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);
    const { searchType } = router.params;

    return (
        <>
            <StyledView className="flex-1 bg-white">
                <HeaderApp />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <StyledView className="flex-1 bg-gray-100">
                        <StyledView className="w-full px-5 mt-2 h-full">
                            <FlatList
                                refreshing={true}
                                onRefresh={() => { }}
                                data={[{ id: 1 }, { id: 2 }]}
                                keyExtractor={(item, index) => `${item.id}_${index}`}
                                renderItem={({ item, index }) => (
                                    <>
                                        <TouchableOpacity onPress={() => navigation.navigate('Chat', { helper: true })} className="flex-row items-center justify-between p-3 rounded-lg">
                                            <StyledView className="flex-row items-center">
                                                <StyledView className="bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                                <StyledView className="ml-2">
                                                    <StyledText className="font-bold">Friend Zone {index}</StyledText>
                                                    <StyledText className="text-gray-500">สวัสดีครับ</StyledText>
                                                </StyledView>
                                            </StyledView>
                                            <StyledText className="text-gray-500">12:00</StyledText>
                                        </TouchableOpacity>
                                    </>
                                )}

                                ListHeaderComponent={() => <>
                                    <StyledView className="w-full px-2 mt-2">
                                        <StyledTextInput
                                            placeholder="ค้นหา"
                                            className="py-2 w-full bg-gray-100 rounded-full text-lg pl-10 pr-9 placeholder-gray-500"
                                            value={search}
                                            onChangeText={setSearch}
                                            inputMode='text'
                                            maxLength={50}
                                        >
                                        </StyledTextInput>

                                        <StyledIonIcon name="search" size={20} color="#9ca3af" className="pl-5 absolute mt-[10px]" />

                                        {search.length > 0 && (
                                            <StyledView className="right-5 absolute mt-[8px] bg-gray-50 rounded-full ">
                                                <StyledIonIcon name="close" size={24} className="" color={""} onPress={() => setSearch('')} />
                                            </StyledView>
                                        )}
                                    </StyledView>

                                    <TouchableOpacity onPress={() => navigation.navigate('Chat', { helper: true })} className="flex-row items-center justify-between p-3 rounded-lg">
                                        <StyledView className="flex-row items-center">
                                            <StyledView className="bg-gray-400 rounded-full w-[40px] h-[40px]" />
                                            <StyledView className="ml-2">
                                                <StyledText className="font-bold">Friend Zone Helper</StyledText>
                                                <StyledText className="text-gray-500">สวัสดีครับ</StyledText>
                                            </StyledView>
                                        </StyledView>
                                        <StyledText className="text-gray-500">12:00</StyledText>
                                    </TouchableOpacity>
                                </>}

                            />
                        </StyledView>
                    </StyledView>
                    
                </KeyboardAvoidingView>

            </StyledView>
            
            <Navigation current="SearchCategory" />
        </>
    )
}
