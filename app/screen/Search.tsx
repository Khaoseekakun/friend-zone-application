import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";
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
interface Item {
    id: number;
}

const StyledFlatList = styled(FlatList<Item>);

type SearchParam = RouteProp<RootStackParamList, 'Search'>;
type SearchOption = {
    searchName?: string;
    searchType: string;
}

type SearchData = {
    id: number;
    name: string;
    age: string;
}
export default function Search() {
    const router = useRoute<SearchParam>();
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);
    const { searchType } = router.params;

    const [data, setData] = useState<SearchData[]>([]);

    useEffect(() => {
        handlerSearch({ searchType: "Friend" })
    }, [])

    function handlerSearch(options: SearchOption) {
        const searchData = [
            { id: 1, name: "Moo", age: "18" },
            { id: 2, name: "Moo", age: "18" },
            { id: 3, name: "Moo", age: "18" },
            { id: 4, name: "Moo", age: "18" },
            { id: 5, name: "Moo", age: "18" },
            { id: 6, name: "Moo", age: "18" },
            { id: 7, name: "Moo", age: "18" },
            { id: 8, name: "Moo", age: "18" },
            { id: 9, name: "Moo", age: "18" },
        ]

        setData(searchData);
    }


    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
        rows.push(data.slice(i, i + 2));
    }

    console.log(rows)

    return (
        <>
            <StyledView className="flex-1">
                <HeaderApp />
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>

                        <StyledView className="flex-1 h-full justify-center">
                            {row.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => { }}
                                    className="rounded-xl h-[40%] bg-gray-500 py-3 justify-center my-1"
                                >
                                    <StyledView className="flex-row ml-2 absolute bottom-8">
                                        <StyledText className="text-white font-custom text-2xl">
                                            {item.name} {item.age}
                                        </StyledText>
                                        <StyledIonIcon
                                            name="female"
                                            color={'pink'}
                                            size={25}
                                            className="self-center"
                                        />
                                    </StyledView>
                                    <StyledView className="flex-row absolute bottom-1">
                                        <StyledIonIcon name="heart" color={'pink'} size={30} className="left-1" />
                                        <StyledText className="left-2 self-center text-white font-custom text-xl">4.1</StyledText>
                                        <StyledText className="ml-3 self-center text-gray-300 font-custom text-sm">(1,502)</StyledText>
                                    </StyledView>
                                </TouchableOpacity>
                            ))}


                        </StyledView>
                    </View>
                ))}
            </StyledView>

            <Navigation current="SearchCategory" />
        </>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 2,
        gap: 2
    }
});
