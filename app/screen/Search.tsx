import React, { useState, useEffect } from "react";
import { View, Text, Button, TouchableOpacity, Platform, KeyboardAvoidingView, StyleSheet, Image, Dimensions } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import axios from "axios";
import { RootStackParamList } from "@/types";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import HeartIcon from "@/components/svg/heart";
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
    image: string;
    gender: string
}

export default function Search() {

    const HEIGHT = Dimensions.get('screen').height;
    const router = useRoute<SearchParam>();
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);
    const { searchType } = router.params;

    const [data, setData] = useState<SearchData[]>([]);

    useEffect(() => {
        handlerSearch({ searchType: "Friend" })
    }, [])

    const [layout, setLayout] = useState(0);

    function handlerSearch(options: SearchOption) {
        const searchData = [
            { id: 1, name: "Maximmilian", age: "18", gender: "หญิง", image: "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg?s=612x612&w=0&k=20&c=oog4FovHj9r2YD17iatNtbOk0h7KygBd7iTMMmxctKg=" },
            { id: 2, name: "Sinsamuth", age: "18", gender: "หญิง", image: "https://st4.depositphotos.com/3563679/38710/i/450/depositphotos_387104672-stock-photo-asia-thai-high-school-student.jpg" },
            { id: 3, name: "Parisa", age: "18", gender: "หญิง", image: "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg?s=612x612&w=0&k=20&c=oog4FovHj9r2YD17iatNtbOk0h7KygBd7iTMMmxctKg=" },
            { id: 4, name: "Bellty", age: "18", gender: "หญิง", image: "https://st4.depositphotos.com/3563679/38710/i/450/depositphotos_387104672-stock-photo-asia-thai-high-school-student.jpg" },
            { id: 5, name: "Parisa", age: "18", gender: "หญิง", image: "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg?s=612x612&w=0&k=20&c=oog4FovHj9r2YD17iatNtbOk0h7KygBd7iTMMmxctKg=" },
            { id: 6, name: "Bellty", age: "18", gender: "หญิง", image: "https://st4.depositphotos.com/3563679/38710/i/450/depositphotos_387104672-stock-photo-asia-thai-high-school-student.jpg" },

        ]

        setData(searchData);
    }


    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
        rows.push(data.slice(i, i + 2));
    }

    return (
        <>
            <StyledView className="flex-1 h-screen bg-gray-100">
                <HeaderApp />
                <FlatList
                    refreshing={searchloading}
                    onRefresh={() => handlerSearch({ searchType: "Friend" })}
                    onStartReachedThreshold={5}
                    data={rows}
                    onEndReached={() => console.log('end')}
                    renderItem={({ item }) => {
                        return layout == 0 ? (
                            <>
                                <StyledView style={styles.row}>
                                    {item.map((data) => (
                                        <StyledView key={data.id} className="flex-1 h-[280px] rounded-lg">
                                            <Image source={{ uri: data.image }} style={{ height: '100%', width: '100%', borderRadius: 10 }} />
                                            <LinearGradient
                                                colors={['#4f4f4f', 'transparent']}
                                                start={{ x: 0, y: 1 }}
                                                end={{ x: 0, y: 0 }}
                                                className="absolute bottom-0 opacity-50 w-full h-[30%] rounded-b-[10px]"
                                            />
                                            <StyledView className="absolute bottom-2 left-2">
                                                <StyledView className="flex-row">
                                                    <StyledText className="font-custom text-white text-xl">{data.name}</StyledText>
                                                    <StyledText className="font-custom text-white text-xl mx-1">{data.age}</StyledText>

                                                    {data.gender == "ชาย" ? (
                                                        <StyledIonIcon className="" name="male" color={'#69ddff'} size={24} />
                                                    ) : (
                                                        <StyledIonIcon className="" name="female" color={'#ff8df6'} size={24} />
                                                    )}
                                                </StyledView>

                                                <StyledView className="flex-row items-center">
                                                    <HeartIcon />
                                                    <StyledText className="font-custom text-white text-xl ml-1">4.1</StyledText>
                                                    <StyledText className="font-custom text-gray-100 ml-1">(1,502)</StyledText>
                                                </StyledView>
                                            </StyledView>
                                        </StyledView>
                                    ))}
                                </StyledView>
                            </>
                        ) : (
                            <StyledView className="">
                                {item.map((data) => (
                                    <StyledView key={data.id} className={` bg-gray-200 w-full`}>
                                        <Image source={{ uri: data.image }} style={{ height: HEIGHT / 2.4, width: '100%' }} />

                                        <LinearGradient
                                            colors={['#4f4f4f', 'transparent']}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 0, y: 0 }}
                                            className="absolute bottom-0 opacity-50 w-full h-[30%]"
                                        />
                                        <StyledView className="absolute bottom-2 left-2">
                                            <StyledView className="flex-row">
                                                <StyledText className="font-custom text-white text-2xl">{data.name}</StyledText>
                                                <StyledText className="font-custom text-white text-2xl mx-1">{data.age}</StyledText>

                                                {data.gender == "ชาย" ? (
                                                    <StyledIonIcon className="" name="male" color={'#69ddff'} size={24} />
                                                ) : (
                                                    <StyledIonIcon className="" name="female" color={'#ff8df6'} size={24} />
                                                )}
                                            </StyledView>

                                            <StyledView className="flex-row items-center">
                                                <HeartIcon />
                                                <StyledText className="font-custom text-white text-xl ml-1">4.1</StyledText>
                                                <StyledText className="font-custom text-gray-100 ml-1">(1,502)</StyledText>
                                            </StyledView>
                                        </StyledView>
                                    </StyledView>

                                ))}
                            </StyledView>
                        );
                    }
                    }
                    ListFooterComponent={() => (
                        <StyledView className="mb-[20%]">
                        </StyledView>
                    )}
                />
                <StyledView className="absolute right-2 top-[110px] opacity-50">
                    <Ionicons
                        onPress={() => setLayout(layout == 0 ? 1 : 0)}
                        name={layout == 1 ? "grid" : "grid-outline"} size={24} color="red" />
                </StyledView>

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
