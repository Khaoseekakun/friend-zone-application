import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform, Dimensions, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Alert } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { RootStackParamList } from "@/types";
import { Navigation } from "@/components/Navigation";
import { HeaderApp } from "@/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import HeartIcon from "@/components/svg/heart";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { getAge } from "@/utils/Date";
import { LatLng } from 'react-native-maps';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledIonicons = styled(Ionicons);
interface Item {
    id: number;
}

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

type IMembersDB = {
    id: string;
    username: string;
    token: string;
    firstname: string;
    lastname: string;
    gender: string;
    verified: boolean;
    profileUrl?: string;
    updatedAt: Date;
    createdAt: Date;
    deleted: boolean;
    province: string[];
    birthday?: Date;
    pinLocation: number[];
    bio?: string;
    rating: number;
    reviews: number;
    previewFirstImageUrl: string;
}



export default function Search() {
    const [userData, setUserData] = useState<any>();
    const HEIGHT = Dimensions.get('screen').height;
    const router = useRoute<SearchParam>();
    const navigation = useNavigation<NavigationProp<any>>();
    const [searchloading, setSearchLoading] = useState(false);
    const [loadPage, setLoadPage] = useState(true);
    const { searchType, backPage } = router.params;
    const [data, setData] = useState<IMembersDB[]>([]);
    const [layout, setLayout] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [ageFilter, setAgeFilter] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<number[]>([]);
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [selfPin, setSelfPin] = useState<LatLng | null>(null);
    const [distance, setDistance] = useState<number>(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await AsyncStorage.getItem('userData');
                if (data) {
                    setUserData(JSON.parse(data));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsUserDataLoaded(true);
            }
        };
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') { // แก้ == เป็น ===
                setHasLocationPermission(true);
                const location = await Location.getCurrentPositionAsync({}); // แก้จาก requestCurrentPermissionsAsync เป็น getCurrentPositionAsync
                setSelfPin({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        };

        requestLocationPermission();
        fetchUserData();

    }, []);

    const genderOptions = [
        {
            name: "ชาย",
            value: "ชาย"
        }, {
            name: "หญิง",
            value: "หญิง"
        }, {
            name: "lgbtq+",
            value: "lgbtq+"
        }
    ]

    const ratingOptions = [
        {
            name: "5",
            value: 5
        }, {
            name: "4",
            value: 4
        }, {
            name: "3",
            value: 3
        }, {
            name: "2",
            value: 2
        }, {
            name: "1",
            value: 1
        }
    ]


    const jobsCategory = {
        "Friend": "673080a432edea568b2a6554",
        "Music": "someMusicCategoryId",
        "Dj": "someDjCategoryId"
    }

    useEffect(() => {
        try {
            if (isUserDataLoaded && userData) {
                handlerSearch(true, { searchType });
            }
        } catch (error) {

        }

        finally {
            setLoadPage(false);
        }
    }, [isUserDataLoaded, userData]);

    async function handlerSearch(filterSearch: boolean, options: SearchOption) {
        try {
            const response = await axios.get(
                `https://friendszone.app/api/search/members?jobsCategory=${jobsCategory[searchType]}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `All ${userData?.token}`, // ตรวจสอบให้แน่ใจว่า API ของคุณต้องการ 'All' หรือ 'Bearer'
                    },
                }
            );

            if (response.status !== 200 || !response.data.data) {
                return Alert.alert("Error", "เกิดข้อผิดพลาดในการค้นหา");
            }

            const membersData = response.data.data.members.map(
                (member: any) => member.MembersDB
            );


            setData(membersData);
        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
    }

    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
        rows.push(data.slice(i, i + 2));
    }

    /**
    * @param {LatLng} point1 
    * @param {LatLng} point2 
    * @returns {number}
    */
    const getDistance = (point1: LatLng, point2: LatLng): number => {
        const R = 6371000;
        const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
        const dLon = (point2.longitude - point1.longitude) * (Math.PI / 180);
        const lat1 = point1.latitude * (Math.PI / 180);
        const lat2 = point2.latitude * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };


    const getDistanceMemberToCustomer = (selfPin: LatLng, memberPin: LatLng): number => {
        return getDistance(selfPin, memberPin);
    }

    const renderGridItem = ({ item }: { item: IMembersDB[] }) => (
        <StyledView style={styles.row}>
            {item.map((data) => (
                <TouchableOpacity
                    key={data.id}
                    style={styles.gridCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ProfileTab', { profileId: data.id, jobCategory: searchType, backPage: "Search" })}
                >
                    <Image
                        source={{ uri: data.previewFirstImageUrl }}
                        style={styles.gridImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.gridInfoContainer}
                    >
                        <StyledView className="absolute bottom-3 px-2">
                            <StyledView className="flex-row items-center">
                                <StyledText className="font-custom text-white text-xl">{data.username}</StyledText>
                                <StyledText className="font-custom text-white text-xl mx-1">{getAge(data.birthday as unknown as string)}</StyledText>
                                <StyledIonIcon
                                    name={data.gender === "ชาย" ? "male" : "female"}
                                    color={data.gender === "ชาย" ? '#69ddff' : '#ff8df6'}
                                    size={24}
                                />
                            </StyledView>
                            <StyledView className="flex-row items-center mt-1">
                                <StyledView className="flex-row items-center">
                                    <HeartIcon />
                                    <StyledText className="font-custom text-white text-lg ml-1">
                                        {data.rating.toFixed(1)}
                                    </StyledText>
                                </StyledView>
                                <StyledView>
                                    <StyledText className="font-custom text-gray-300 text-sm ml-1">
                                        ( 10{distance > 0 && `(${
                                                distance > 1000
                                                    ? `${(distance / 1000).toFixed(1)} Km`
                                                    : `${distance.toFixed(0)} M`
                                            })`} km.)
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>

                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </StyledView>
    );

    const renderListItem = ({ item }: { item: IMembersDB[] }) => (
        <StyledView>
            {item.map((data, index) => (
                <TouchableOpacity
                    key={`${data.id}-${index}`}
                    style={styles.listCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ProfileTab', { profileId: data.id, jobCategory: searchType, backPage: "Search" })}
                >
                    <Image
                        source={{ uri: data.previewFirstImageUrl }}
                        style={[styles.listImage, { height: HEIGHT / 2.4 }]}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.8)', 'transparent']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.listInfoContainer}
                    >
                        <StyledView className="flex-row justify-between items-center w-full px-4 -bottom-6">
                            <StyledView className="flex-row items-center">
                                <StyledText className="font-custom text-white text-2xl">{data.username}</StyledText>
                                <StyledText className="font-custom text-white text-2xl mx-2">{getAge(data.birthday as unknown as string)}</StyledText>
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
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <StyledView className="flex-1 bg-gray-100">

                    <HeaderApp />
                    {
                        loadPage ? (
                            <>
                                <StyledView className="flex-1 justify-center items-center">
                                    <ActivityIndicator size="large" color="#FF4B6C" />
                                </StyledView>
                            </>
                        ) : (
                            <>
                                <FlatList
                                    refreshing={searchloading}
                                    // onRefresh={() => handlerSearch(true, { searchType: "Friend" })}
                                    data={rows}
                                    renderItem={layout === 0 ? renderGridItem : renderListItem}
                                    ListFooterComponent={() => (
                                        <StyledView className="mb-[20%]" />
                                    )}
                                    showsVerticalScrollIndicator={false}
                                />
                                <StyledTouchableOpacity
                                    className="absolute right-[2%] top-[14%] w-[35px] h-[35px] items-center justify-center rounded-full bg-white"
                                    onPress={() => setLayout(layout === 0 ? 1 : 0)}
                                >
                                    <Ionicons
                                        name={layout === 1 ? "grid" : "grid-outline"}
                                        size={24}
                                        color="#FF4B6C"
                                    />
                                </StyledTouchableOpacity>

                                <StyledTouchableOpacity
                                    className="absolute right-[12%] top-[14%] w-[35px] h-[35px] items-center justify-center rounded-full bg-white"
                                    onPress={() => {
                                        setIsOpen(true);
                                    }}
                                >
                                    <Ionicons
                                        name={"search"}
                                        size={24}
                                        color="#FF4B6C"
                                    />
                                </StyledTouchableOpacity>
                            </>
                        )
                    }
                </StyledView>

                <Navigation current="SearchCategory" />

                {isOpen && (
                    <StyledView className="absolute w-full h-full justify-center items-center">

                        <TouchableOpacity className="absolute flex-1 bg-black opacity-25 w-full h-screen justify-center"
                            onPress={() => setIsOpen(false)}>
                        </TouchableOpacity>

                        <StyledView className="absolute flex-1 bg-white w-[90%] h-[40%] rounded-2xl">
                            <StyledTouchableOpacity className="absolute right-0 m-2"
                                onPress={() => setIsOpen(false)}
                            >
                                <StyledIonicons
                                    name="close"
                                    size={30}
                                    color="black"
                                />
                            </StyledTouchableOpacity>
                            <StyledView className="mt-10 h-[1px] bg-gray-200 w-full"></StyledView>
                            <StyledView className="px-3 py-1">
                                <StyledText className="font-custom pl-2 pb-1 text-lg">เพศ</StyledText>
                                <StyledView className="flex-row">
                                    {genderOptions.map((option, index) => (
                                        <StyledTouchableOpacity
                                            key={index}
                                            className={`px-3 py-1 rounded-full m-1 ${genderFilter.includes(option.value) ? 'bg-red-500' : 'bg-gray-200'}`}
                                            onPress={() => {
                                                if (genderFilter.includes(option.value)) {
                                                    setGenderFilter(genderFilter.filter((item) => item !== option.value));
                                                }
                                                else {
                                                    setGenderFilter([...genderFilter, option.value]);
                                                }

                                            }}
                                        >
                                            <StyledText className={`font-custom text-lg ${genderFilter.includes(option.value) ? 'text-white' : 'text-black'}`}>{option.name}</StyledText>
                                        </StyledTouchableOpacity>
                                    ))}
                                </StyledView>

                            </StyledView>
                            <StyledView className="px-3 py-1">
                                <StyledText className="font-custom pl-2 pb-1 text-lg">คะแนน</StyledText>
                                <StyledView className="flex-row">
                                    {ratingOptions.map((option, index) => (
                                        <StyledTouchableOpacity
                                            key={index}
                                            className={`px-4 py-1 rounded-full m-1 ${ratingFilter.includes(option.value) ? 'bg-red-500' : 'bg-gray-200'}`}
                                            onPress={() => {
                                                if (ratingFilter.includes(option.value)) {
                                                    setRatingFilter(ratingFilter.filter((item) => item !== option.value));
                                                }
                                                else {
                                                    setRatingFilter([...ratingFilter, option.value]);
                                                }
                                            }}
                                        >
                                            <StyledText className={`font-custom text-lg mx-2 ${ratingFilter.includes(option.value) ? 'text-white' : 'text-black'}`}>{option.name}</StyledText>
                                        </StyledTouchableOpacity>
                                    ))}
                                </StyledView>
                            </StyledView>

                            <StyledTouchableOpacity className="absolute bg-red-500 rounded-full mb-4 mx-3 py-1 px-2 bottom-0 w-[90%] self-center"
                                onPress={() => {
                                    handlerSearch
                                    setIsOpen(false);
                                }}
                            >
                                <StyledText className="font-custom text-lg text-white text-center">ค้นหา</StyledText>
                            </StyledTouchableOpacity>
                        </StyledView>
                    </StyledView>

                )}

            </KeyboardAvoidingView>
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