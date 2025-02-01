import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import axios from 'axios';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types'; // Adjust the import path as needed
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledIonicons = styled(Ionicons);
type PolicyParam = RouteProp<RootStackParamList, 'Policy'>;

export default function Policy() {
    const [policyContent, setPolicyContent] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRoute<PolicyParam>()
    const { backPage } = router.params;

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    useEffect(() => {
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
        fetchPolicyContent();
    }, []);

    if (loading) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
                <ActivityIndicator size="large" color="#EB3834" />
            </StyledView>
        );
    }

    if (error) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
                <StyledText className="text-red-500">{error}</StyledText>
            </StyledView>
        );
    }

    return (
        <StyledView className="bg-white dark:bg-neutral-900 flex-1">

            <StyledText className="font-custom text-xl text-gray-900 dark:text-white text-center mt-16">เงื่อนไขและข้อตกลง</StyledText>
            <StyledText className="font-custom text-xl text-gray-900 dark:text-white text-center">Friend Zone</StyledText>
            <StyledView className="absolute mt-[70px] left-5">
                <TouchableOpacity onPress={() => backPage ? navigation.navigate(backPage as any, {}) : navigation.goBack()} className="absolute ml-4">
                    <StyledIonicons name="chevron-back" size={32} className='text-black dark:text-neutral-200' />
                </TouchableOpacity>
            </StyledView>
            <ScrollView className="flex-1 w-10/12 mt-6 p-2 mb-6 rounded-xl self-center bg-gray-100 dark:bg-neutral-800">
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
        </StyledView>
    );
}