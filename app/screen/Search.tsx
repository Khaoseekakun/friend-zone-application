import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, Dimensions, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Alert, useColorScheme } from "react-native";
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
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
import { ScrollView } from "react-native-gesture-handler";

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
    const [MinAgeFilter, setMinAgeFilter] = useState<string>('');
    const [MaxAgeFilter, setMaxAgeFilter] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<number[]>([]);
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [selfPin, setSelfPin] = useState<LatLng | null>(null);
    const [distance, setDistance] = useState<number>(0);
    const [saveSearchType, setSaveSearchType] = useState<string>('');
    const colorScheme = useColorScheme();

    const isFoucs = useIsFocused()


    const [provinces, setProvinces] = useState<{
        id: string;
        name: string;
    }[]>([]);

    const [jobTypes, setJobTypes] = useState<{
        id: string;
        name: string;
    }[]>([]);


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



    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);

    const [selectedProvince, setSelectedProvince] = useState<{
        id: string;
        name: string;
    }>();

    const [selectedJobType, setSelectedJobType] = useState<{
        id: string;
        name: string;
    }>();

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

    useEffect(() => {
        if (isFoucs != false) {
            try {
                if (isUserDataLoaded && userData) {
                    if (searchType == undefined) {
                        handlerSearch(false, { searchType: saveSearchType });
                    } else {
                        setSaveSearchType(searchType);
                        handlerSearch(false, { searchType: searchType });
                    }

                    const fetchProvinces = async () => {
                        try {
                            const response = await axios.get(
                                "http://49.231.43.37:3000/api/province",
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            );

                            if (response.status !== 200 || !response.data.body) {
                                return Alert.alert("Error", "เกิดข้อผิดพลาดในการโหลดจังหวัด");
                            }

                            const provincesData = response.data.body.map(
                                (province: any) => ({
                                    id: province.id,
                                    name: province.name,
                                })
                            );

                            setProvinces(provincesData);
                        } catch (error) {
                            console.error("Error fetching provinces:", error);
                            Alert.alert("Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                        }
                    };

                    const fetchJobTypes = async () => {
                        try {
                            const response = await axios.get(
                                `http://49.231.43.37:3000/api/categoryJobs/${searchType == undefined ? saveSearchType : searchType}/jobslist`,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            );

                            if (response.status !== 200 || !response.data.body) {
                                return Alert.alert("Error", "เกิดข้อผิดพลาดในการโหลดประเภทงาน");
                            }

                            const jobTypesData = response.data.body.map(
                                (jobType: any) => ({
                                    id: jobType.id,
                                    name: jobType.jobName,
                                })
                            );

                            setJobTypes(jobTypesData);
                        } catch (error) {
                            console.error("Error fetching job types:", error);
                            Alert.alert("Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                        }
                    };

                    fetchProvinces();
                    fetchJobTypes();

                }
            } catch (error) {

            }

            finally {
                setLoadPage(false);
            }
        }

    }, [isUserDataLoaded, userData, isFoucs]);

    async function handlerSearch(filterSearch: boolean, options: SearchOption) {
        try {
            setSearchLoading(true);
            let url = `http://49.231.43.37:3000/api/search/members?jobsCategory=${searchType == undefined ? saveSearchType : searchType}`
            let deafult_age = '18-99'

            if (filterSearch == true) {
                url += '&filter=true'

                if (selectedProvince) {
                    url += `&province=${selectedProvince.id}`
                }

                if (selectedJobType) {
                    url += `&jobType=${selectedJobType.id}`
                }

                if (genderFilter.length > 0) {
                    for (let i = 0; i < genderFilter.length; i++) {
                        url += `&gender=${genderFilter[i]}`
                    }
                }

                if (MinAgeFilter) {
                    deafult_age = deafult_age.replace('18', MinAgeFilter)
                }

                if (MaxAgeFilter) {
                    deafult_age = deafult_age.replace('99', MaxAgeFilter)
                }

                if (ratingFilter.length > 0) {
                    for (let i = 0; i < ratingFilter.length; i++) {
                        url += `&rating=${ratingFilter[i]}`
                    }
                }

            }



            const response = await axios.get(
                url,
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

            if (response.data.data.members.length === 0) {
                setData([]);
            } else {
                const membersData = response.data.data.members.map(
                    (member: any) => member.MembersDB
                );

                setData(membersData);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setSearchLoading(false);
        }
    }

    const rows = [];
    for (let i = 0; i < data?.length; i += 2) {
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

    const renderGridItem = ({ item }: { item: IMembersDB[] }) => {
        return !searchloading ? (
            <StyledView style={styles.row}>
                {item.map((data) => (
                    <TouchableOpacity
                        key={data.id}
                        style={styles.gridCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('ProfileTab', { profileId: data.id, jobCategory: searchType, backPage: "Search", backOptions: { searchType } })}
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
                                            ( 10{distance > 0 && `(${distance > 1000
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
        ) : null
    }

    const renderListItem = ({ item }: { item: IMembersDB[] }) => {
        return !searchloading ? (
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
        ) : null
    }

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <StyledView className="flex-1 bg-gray-200 dark:bg-neutral-900">

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
                                    onRefresh={() => handlerSearch(true, { searchType })}
                                    data={rows}
                                    renderItem={layout === 0 ? renderGridItem : renderListItem}
                                    ListFooterComponent={() => (
                                        <StyledView className="mb-[20%]" />
                                    )}

                                    ListHeaderComponent={() => {
                                        return searchloading ? (
                                            <StyledView className="flex-1 justify-center items-center">
                                                <ActivityIndicator size="large" color="#FF4B6C" />
                                            </StyledView>
                                        ) : null;
                                    }}

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
                    <StyledView className="absolute w-full h-screen justify-center items-center">
                        <TouchableOpacity
                            className="absolute flex-1 bg-black opacity-25 w-full h-screen justify-center"
                            onPress={() => setIsOpen(false)}
                        >
                        </TouchableOpacity>

                        <StyledView className="absolute flex-1 bg-white dark:bg-neutral-900 border border-white/20 w-[90%] h-[70%] rounded-2xl">
                            <StyledTouchableOpacity
                                className="absolute right-0 m-2"
                                onPress={() => setIsOpen(false)}
                            >
                                <StyledIonicons
                                    name="close"
                                    size={30}
                                    color={colorScheme === 'dark' ? "white" : "black"}
                                />
                            </StyledTouchableOpacity>

                            <ScrollView className="flex-1 mt-12">
                                <StyledView className="px-3 py-1">
                                    <StyledText className="font-custom dark:text-white pl-2 pb-1 text-lg">จังหวัด</StyledText>
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-gray-100 dark:bg-neutral-800 rounded-full py-3 px-4"
                                        onPress={() => setShowProvinceDropdown(true)}
                                    >
                                        <StyledText className="font-custom text-gray-700 dark:text-gray-300">
                                            {selectedProvince?.name || "เลือกจังหวัด"}
                                        </StyledText>
                                        <StyledIonicons
                                            name="chevron-down"
                                            size={20}
                                            color={colorScheme === 'dark' ? "#9CA3AF" : "#4B5563"}
                                        />
                                    </TouchableOpacity>
                                </StyledView>

                                <StyledView className="px-3 py-1">
                                    <StyledText className="font-custom dark:text-white pl-2 pb-1 text-lg">เพศ</StyledText>
                                    <StyledView className="flex-row flex-wrap">
                                        {genderOptions.map((option, index) => (
                                            <StyledTouchableOpacity
                                                key={index}
                                                className={`px-3 py-1 rounded-full m-1 ${genderFilter.includes(option.value) ? 'bg-red-500' : 'bg-gray-200 dark:bg-neutral-700'}`}
                                                onPress={() => {
                                                    if (genderFilter.includes(option.value)) {
                                                        setGenderFilter(genderFilter.filter((item) => item !== option.value));
                                                    } else {
                                                        setGenderFilter([...genderFilter, option.value]);
                                                    }
                                                }}
                                            >
                                                <StyledText className={`font-custom text-lg ${genderFilter.includes(option.value) ? 'text-white' : 'text-black dark:text-white'}`}>
                                                    {option.name}
                                                </StyledText>
                                            </StyledTouchableOpacity>
                                        ))}
                                    </StyledView>
                                </StyledView>

                                <StyledView className="px-3 py-1">
                                    <StyledText className="font-custom dark:text-white pl-2 pb-1 text-lg">อายุ</StyledText>
                                    <StyledView className="flex-row items-center">
                                        <StyledTextInput
                                            className="flex-1 font-custom bg-gray-100 dark:bg-neutral-800 rounded-full py-2 px-4 text-base dark:text-white mr-2"
                                            placeholder="อายุต่ำสุด"
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                            maxLength={2}
                                            onChangeText={(text) => setMinAgeFilter(text)}
                                        />
                                        <StyledText className="font-custom dark:text-white mx-2">-</StyledText>
                                        <StyledTextInput
                                            className="flex-1 font-custom bg-gray-100 dark:bg-neutral-800 rounded-full py-2 px-4 text-base dark:text-white ml-2"
                                            placeholder="อายุสูงสุด"
                                            keyboardType="numeric"
                                            placeholderTextColor="#9CA3AF"
                                            maxLength={2}
                                            onChangeText={(text) => setMaxAgeFilter(text)}
                                        />
                                    </StyledView>
                                </StyledView>

                                <StyledView className="px-3 py-1">
                                    <StyledText className="font-custom dark:text-white pl-2 pb-1 text-lg">คะแนน</StyledText>
                                    <StyledView className="flex-row flex-wrap">
                                        {ratingOptions.map((option, index) => (
                                            <StyledTouchableOpacity
                                                key={index}
                                                className={`px-4 py-1 rounded-full m-1 ${ratingFilter.includes(option.value) ? 'bg-red-500' : 'bg-gray-200 dark:bg-neutral-700'}`}
                                                onPress={() => {
                                                    if (ratingFilter.includes(option.value)) {
                                                        setRatingFilter(ratingFilter.filter((item) => item !== option.value));
                                                    } else {
                                                        setRatingFilter([...ratingFilter, option.value]);
                                                    }
                                                }}
                                            >
                                                <StyledText className={`font-custom text-lg mx-2 ${ratingFilter.includes(option.value) ? 'text-white' : 'text-black dark:text-white'}`}>
                                                    {option.name}
                                                </StyledText>
                                            </StyledTouchableOpacity>
                                        ))}
                                    </StyledView>
                                </StyledView>

                                <StyledView className="px-3 py-1">
                                    <StyledText className="font-custom dark:text-white pl-2 pb-1 text-lg">ประเภทงาน</StyledText>
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-gray-100 dark:bg-neutral-800 rounded-full py-3 px-4"
                                        onPress={() => setShowJobTypeDropdown(true)}
                                    >
                                        <StyledText className="font-custom text-gray-700 dark:text-gray-300">
                                            {selectedJobType?.name || "เลือกประเภทงาน"}
                                        </StyledText>
                                        <StyledIonicons
                                            name="chevron-down"
                                            size={20}
                                            color={colorScheme === 'dark' ? "#9CA3AF" : "#4B5563"}
                                        />
                                    </TouchableOpacity>
                                </StyledView>

                                <StyledView className="h-20" />
                            </ScrollView>

                            <StyledView className="absolute bottom-0 w-full flex-row">
                                <StyledTouchableOpacity
                                    className="mb-3 px-2 bottom-0 w-6/12 self-center"
                                    onPress={() => {
                                        setGenderFilter([]);
                                        setRatingFilter([]);
                                        setMinAgeFilter('');
                                        setMaxAgeFilter('');
                                        setSelectedProvince(undefined);
                                        setSelectedJobType(undefined);
                                    }}
                                >
                                    <StyledText className="bg-gray-500 rounded-full py-2  font-custom text-lg text-white text-center">คืนค่า</StyledText>
                                </StyledTouchableOpacity>
                                <StyledTouchableOpacity
                                    className=" mb-3 px-2 bottom-0 w-6/12 self-center"
                                    onPress={() => {
                                        handlerSearch(true, { searchType });
                                        setIsOpen(false);
                                    }}
                                >
                                    <StyledText className="bg-red-500 rounded-full py-2  font-custom text-lg text-white text-center">ค้นหา</StyledText>
                                </StyledTouchableOpacity>
                            </StyledView>
                        </StyledView>

                        {showProvinceDropdown && (
                            <StyledView className="absolute w-full h-full bg-black/50">
                                <TouchableOpacity
                                    className="absolute w-full h-full"
                                    onPress={() => setShowProvinceDropdown(false)}
                                />
                                <StyledView className="absolute bottom-0 w-full bg-white dark:bg-neutral-900 rounded-t-3xl">
                                    <StyledView className="w-12 h-1 bg-gray-300 rounded-full self-center my-3" />
                                    <ScrollView className="max-h-96 px-4">
                                        {provinces.map((province, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                className="py-4 border-b border-gray-200 dark:border-neutral-800"
                                                onPress={() => {
                                                    setSelectedProvince(province);
                                                    setShowProvinceDropdown(false);
                                                }}
                                            >
                                                <StyledText className="font-custom text-lg text-gray-700 dark:text-gray-300">
                                                    {province.name}
                                                </StyledText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </StyledView>
                            </StyledView>
                        )}

                        {showJobTypeDropdown && (
                            <StyledView className="absolute w-full h-full bg-black/50">
                                <TouchableOpacity
                                    className="absolute w-full h-full"
                                    onPress={() => setShowJobTypeDropdown(false)}
                                />
                                <StyledView className="absolute bottom-0 w-full bg-white dark:bg-neutral-900 rounded-t-3xl">
                                    <StyledView className="w-12 h-1 bg-gray-300 rounded-full self-center my-3" />
                                    <ScrollView className="max-h-96 px-4">
                                        {jobTypes.map((jobType, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                className="py-4 border-b border-gray-200 dark:border-neutral-800"
                                                onPress={() => {
                                                    setSelectedJobType(jobType);
                                                    setShowJobTypeDropdown(false);
                                                }}
                                            >
                                                <StyledText className="font-custom text-lg text-gray-700 dark:text-gray-300">
                                                    {jobType.name}
                                                </StyledText>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </StyledView>
                            </StyledView>
                        )}
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