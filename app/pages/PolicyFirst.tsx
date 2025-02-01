import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { styled } from 'nativewind';
import axios from 'axios';
import { useNavigation } from "expo-router";
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types'; // Adjust the import path as needed
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIcon = styled(Ionicons);

export default function AgreementScreen() {
    const colorScheme = useColorScheme();
    const [policyContent, setPolicyContent] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [agree, setAgree] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const fetchPolicyContent = async () => {
        try {
            const response = await axios.get('https://friendszone.app/api/policy');
            const policyData = response.data.body.map((item: any) => item.content);
            setPolicyContent(policyData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load policy content. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchPolicyContent();
    }, []);

    const handleAgree = () => {
        navigation.navigate('SelectRegisterPage', {});
    };

    if (loading) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#EB3834" />
            </StyledView>
        );
    }

    if (error) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black">
                <StyledText className="text-red-500">{error}</StyledText>
            </StyledView>
        );
    }

    return (
        <StyledView className="bg-white dark:bg-neutral-900 flex-1">


            <StyledText className="font-custom text-xl text-gray-900 dark:text-white text-center mt-16">ยินดีต้อนรับสู่</StyledText>
            <StyledText className="font-custom text-xl text-gray-900 dark:text-white text-center">Friend Zone</StyledText>
            <StyledText className="font-custom text-base text-gray-400 text-center mt-1">โปรดอ่านเงื่อนไขและข้อตกลง</StyledText>

            <TouchableOpacity onPress={() => navigation.navigate('Login', {})} className="absolute mt-16 px-3">
                <Ionicons name="chevron-back" size={32} color="#1e3a8a" />
            </TouchableOpacity>

            <ScrollView className="flex-1 w-10/12 mt-6 p-2 rounded-xl self-center bg-gray-100 dark:bg-neutral-800">
                {policyContent.map((item, index) => (
                    <StyledView key={`${index}`} className=''>
                        {item.split('\n').map((line, lineIndex) => (
                            <StyledView key={lineIndex} className='mb-4'>
                                <StyledText className="font-custom text-xs text-gray-800 dark:text-white ">
                                    {`${line.replace(/\\n/g, '\n\n')}`}
                                </StyledText>
                            </StyledView>
                        ))}
                    </StyledView>
                ))}
            </ScrollView>


            <StyledView className='flex-row w-4/5 self-center mt-2 items-center'>
                <TouchableOpacity
                    onPress={() => { setAgree(!agree) }}
                >
                    <StyledIcon
                        name={agree ? "checkbox-outline" : "stop-outline"}
                        size={30}
                        className={`${agree ? "text-black dark:text-white" : "text-red-500"}`}
                    >

                    </StyledIcon>
                </TouchableOpacity>
                <StyledText className={`font-custom text-center ${agree ? "text-black dark:text-white" : "text-red-500"} font-semibold ml-1 text-[17px]`}>ฉันได้อ่านและยอมรับข้อตกลงนี้</StyledText>
            </StyledView>
            <TouchableOpacity className="w-4/5 mb-16 self-center mt-11"
                disabled={!agree}
                onPress={handleAgree}
            >
                <LinearGradient

                    colors={agree ? colorScheme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316'] : ['#7f7f7f', '#505050']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full py-3 shadow-sm"
                >
                    <StyledText className="font-custom text-center text-white text-lg font-semibold">ถัดไป</StyledText>
                </LinearGradient>
            </TouchableOpacity>
        </StyledView>
    );
}