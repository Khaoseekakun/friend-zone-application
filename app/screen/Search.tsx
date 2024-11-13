import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, Dimensions, StyleSheet, Image, ActivityIndicator } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { RootStackParamList } from "@/types";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import HeartIcon from "@/components/svg/heart";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);

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
    id: string;
    name: string;
    age: string;
    image: string;
    gender: string;
    rating: number;
    reviews: number;
}

export default function Search() {
    const HEIGHT = Dimensions.get('screen').height;
    const WIDTH = Dimensions.get('screen').width;
    const router = useRoute<SearchParam>();
    const navigation = useNavigation<NavigationProp<any>>();
    const [search, setSearch] = useState('');
    const [searchloading, setSearchLoading] = useState(false);
    const { searchType, backPage } = router.params;
    const [data, setData] = useState<SearchData[]>([]);
    const [layout, setLayout] = useState(0);
    useEffect(() => {
        handlerSearch({ searchType });
    }, []);

    function handlerSearch(options: SearchOption) {
        const searchData = [
            { id: '671a581526204568fd6fb371', name: "Maximmilian", age: "18", gender: "หญิง", image: "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg?s=612x612&w=0&k=20&c=oog4FovHj9r2YD17iatNtbOk0h7KygBd7iTMMmxctKg=", rating: 4.1, reviews: 1502 },
            { id: '671a581526204568fd6fb372', name: "Sinsamuth", age: "18", gender: "หญิง", image: "https://st4.depositphotos.com/3563679/38710/i/450/depositphotos_387104672-stock-photo-asia-thai-high-school-student.jpg", rating: 4.5, reviews: 2103 },
            // ... other data
        ];
        setData(searchData);
    }

    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
        rows.push(data.slice(i, i + 2));
    }

    const renderGridItem = ({ item }: { item: SearchData[] }) => (
        <StyledView style={styles.row}>
            {item.map((data) => (
                <TouchableOpacity 
                    key={data.id} 
                    style={styles.gridCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ProfileTab',  { profileId: data.id, jobCategory: searchType, backPage: "SearchCategory"})}
                >
                    <Image 
                        source={{ uri: data.image }} 
                        style={styles.gridImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gridInfoContainer}
                    >
                        <StyledView className="flex-row items-center">
                            <StyledText className="font-custom text-white text-xl">{data.name}</StyledText>
                            <StyledText className="font-custom text-white text-xl mx-1">{data.age}</StyledText>
                            <StyledIonIcon
                                name={data.gender === "ชาย" ? "male" : "female"}
                                color={data.gender === "ชาย" ? '#69ddff' : '#ff8df6'}
                                size={24}
                            />
                        </StyledView>
                        <StyledView className="flex-row items-center mt-1">
                            <HeartIcon />
                            <StyledText className="font-custom text-white text-lg ml-1">
                                {data.rating.toFixed(1)}
                            </StyledText>
                            <StyledText className="font-custom text-gray-300 text-sm ml-1">
                                ({data.reviews.toLocaleString()})
                            </StyledText>
                        </StyledView>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </StyledView>
    );

    const renderListItem = ({ item }: { item: SearchData[] }) => (
        <StyledView>
            {item.map((data, index) => (
                <TouchableOpacity 
                    key={`${data.id}-${index}`}
                    style={styles.listCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ProfileTab', { profileId: data.id, jobCategory: searchType, backPage: "SearchCategory" })}
                >
                    <Image 
                        source={{ uri: data.image }} 
                        style={[styles.listImage, { height: HEIGHT / 2.4 }]}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.listInfoContainer}
                    >
                        <StyledView className="flex-row justify-between items-center w-full px-4">
                            <StyledView className="flex-row items-center">
                                <StyledText className="font-custom text-white text-2xl">{data.name}</StyledText>
                                <StyledText className="font-custom text-white text-2xl mx-2">{data.age}</StyledText>
                                <StyledIonIcon
                                    name={data.gender === "ชาย" ? "male" : "female"}
                                    color={data.gender === "ชาย" ? '#69ddff' : '#ff8df6'}
                                    size={28}
                                />
                            </StyledView>
                            <StyledView className="flex-row items-center">
                                <HeartIcon />
                                <StyledText className="font-custom text-white text-xl ml-2">
                                    {data.rating.toFixed(1)}
                                </StyledText>
                                <StyledText className="font-custom text-gray-300 text-sm ml-1">
                                    ({data.reviews.toLocaleString()})
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </StyledView>
    );

    return (
        <>
            <StyledView className="flex-1 bg-gray-100">
                <HeaderApp />
                <FlatList
                    refreshing={searchloading}
                    onRefresh={() => handlerSearch({ searchType: "Friend" })}
                    data={rows}
                    renderItem={layout === 0 ? renderGridItem : renderListItem}
                    ListFooterComponent={() => (
                        <StyledView className="mb-[20%]" />
                    )}
                    showsVerticalScrollIndicator={false}
                />
                <TouchableOpacity 
                    style={styles.layoutToggle}
                    onPress={() => setLayout(layout === 0 ? 1 : 0)}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                        style={styles.layoutToggleInner}
                    >
                        <Ionicons
                            name={layout === 1 ? "grid" : "grid-outline"}
                            size={24}
                            color="#FF4B6C"
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </StyledView>
            <Navigation current="SearchCategory" />
        </>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 4,
        gap: 4
    },
    gridCard: {
        flex: 1,
        height: 280,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gridImage: {
        height: '100%',
        width: '100%',
    },
    gridInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        padding: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    listCard: {
        marginBottom: 12,
        marginHorizontal: 4,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listImage: {
        width: '100%',
    },
    listInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        justifyContent: 'center',
    },
    layoutToggle: {
        position: 'absolute',
        right: 16,
        top: 110,
        zIndex: 1,
    },
    layoutToggleInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.8)',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});