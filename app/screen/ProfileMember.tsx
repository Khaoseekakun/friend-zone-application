import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "@/types";
import HeartIcon from "@/components/svg/heart";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

type ProfileParam = RouteProp<RootStackParamList, 'ProfileMember'>;

interface ProfileData {
    id: number;
    name: string;
    age: string;
    gender: string;
    about: string;
    interests: string[];
    photos: string[];
    location: string;
    education: string;
    rating: number;
    reviews: number;
}

export default function Profile() {
    const navigation = useNavigation();
    const route = useRoute<ProfileParam>();
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        // Mock data - ในการใช้งานจริงควรดึงข้อมูลจาก API
        const mockData: ProfileData = {
            id: 1,
            name: "Maximmilian",
            age: "18",
            gender: "หญิง",
            about: "สวัสดีค่ะ ชอบดูหนัง ฟังเพลง และเล่นกีฬา กำลังศึกษาอยู่ที่มหาวิทยาลัยเชียงใหม่ค่ะ",
            interests: ["หนัง", "ดนตรี", "กีฬา", "ท่องเที่ยว", "อ่านหนังสือ", "ถ่ายรูป"],
            photos: [
                "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg",
                "https://st4.depositphotos.com/3563679/38710/i/450/depositphotos_387104672-stock-photo-asia-thai-high-school-student.jpg",
                "https://media.istockphoto.com/id/1360667973/photo/portrait-of-thai-high-school-student-in-student-uniform.jpg",
            ],
            location: "เชียงใหม่, ประเทศไทย",
            education: "มหาวิทยาลัยเชียงใหม่",
            rating: 4.1,
            reviews: 1502,
        };
        setProfileData(mockData);
    }, []);

    if (!profileData) return null;

    return (
        <StyledView className="flex-1 bg-gray-100">
            {/* Header */}
            <StyledView className="absolute top-12 left-4 z-10">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
            </StyledView>

            <StyledScrollView showsVerticalScrollIndicator={false}>
                {/* Main Photo */}
                <StyledView style={{ height: SCREEN_HEIGHT * 0.6 }}>
                    <Image 
                        source={{ uri: profileData.photos[0] }} 
                        style={styles.mainPhoto}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={styles.headerGradient}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bottomGradient}
                    >
                        <StyledView className="px-4 pb-6">
                            <StyledView className="flex-row items-center justify-between">
                                <StyledView>
                                    <StyledText className="text-white text-3xl font-bold">
                                        {profileData.name}, {profileData.age}
                                    </StyledText>
                                    <StyledText className="text-gray-300 text-lg mt-1">
                                        {profileData.location}
                                    </StyledText>
                                </StyledView>
                                <StyledView className="flex-row items-center">
                                    <HeartIcon />
                                    <StyledText className="text-white text-xl ml-2">
                                        {profileData.rating}
                                    </StyledText>
                                    <StyledText className="text-gray-300 text-sm ml-1">
                                        ({profileData.reviews})
                                    </StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    </LinearGradient>
                </StyledView>

                {/* Profile Content */}
                <StyledView className="px-4 py-6">
                    {/* About Section */}
                    <StyledView className="mb-6">
                        <StyledText className="text-xl font-bold mb-2">เกี่ยวกับฉัน</StyledText>
                        <StyledText className="text-gray-600 leading-6">
                            {profileData.about}
                        </StyledText>
                    </StyledView>

                    {/* Education */}
                    <StyledView className="mb-6">
                        <StyledText className="text-xl font-bold mb-2">การศึกษา</StyledText>
                        <StyledView className="flex-row items-center">
                            <Ionicons name="school-outline" size={20} color="#666" />
                            <StyledText className="text-gray-600 ml-2">
                                {profileData.education}
                            </StyledText>
                        </StyledView>
                    </StyledView>

                    {/* Interests */}
                    <StyledView className="mb-6">
                        <StyledText className="text-xl font-bold mb-2">ความสนใจ</StyledText>
                        <StyledView className="flex-row flex-wrap gap-2">
                            {profileData.interests.map((interest, index) => (
                                <StyledView 
                                    key={index}
                                    className="bg-gray-200 rounded-full px-4 py-2"
                                >
                                    <StyledText className="text-gray-700">
                                        {interest}
                                    </StyledText>
                                </StyledView>
                            ))}
                        </StyledView>
                    </StyledView>

                    {/* Photo Gallery */}
                    <StyledView>
                        <StyledText className="text-xl font-bold mb-2">รูปภาพ</StyledText>
                        <StyledView className="flex-row flex-wrap gap-2">
                            {profileData.photos.map((photo, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={[styles.galleryImage, { width: (SCREEN_WIDTH - 32 - 4) / 3 }]}
                                >
                                    <Image 
                                        source={{ uri: photo }}
                                        style={styles.galleryImageContent}
                                    />
                                </TouchableOpacity>
                            ))}
                        </StyledView>
                    </StyledView>
                </StyledView>
            </StyledScrollView>

            {/* Action Buttons */}
            <StyledView className="absolute bottom-8 left-0 right-0 px-4">
                <StyledView className="flex-row justify-between">
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#FF4B6C' }]}
                        className="flex-1 mr-2"
                    >
                        <StyledText className="text-white text-lg font-bold">
                            ส่งข้อความ
                        </StyledText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#4B7BFF' }]}
                        className="flex-1 ml-2"
                    >
                        <StyledText className="text-white text-lg font-bold">
                            เพิ่มเพื่อน
                        </StyledText>
                    </TouchableOpacity>
                </StyledView>
            </StyledView>
        </StyledView>
    );
}

const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainPhoto: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        justifyContent: 'flex-end',
    },
    galleryImage: {
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    galleryImageContent: {
        width: '100%',
        height: '100%',
    },
    actionButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});