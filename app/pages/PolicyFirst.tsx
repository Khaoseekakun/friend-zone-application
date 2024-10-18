import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import axios from 'axios';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types'; // Adjust the import path as needed
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

type AgreementScreenRouteProp = RouteProp<RootStackParamList, 'Agreement'>;

export default function AgreementScreen() {
    const [policyContent, setPolicyContent] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<AgreementScreenRouteProp>();
    const { nextScreen } = route.params;

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

    const handleAgree = () => {
        navigation.navigate(nextScreen);
    };

    if (loading) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </StyledView>
        );
    }

    if (error) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white">
                <StyledText className="text-red-500">{error}</StyledText>
            </StyledView>
        );
    }

    return (
        <StyledView className="flex-1 bg-white">
            <ScrollView className="flex-1 w-4/5 mt-6 self-center">
                <StyledText className="text-xl font-bold text-gray-900 text-center">ยินดีต้อนรับสู่</StyledText>
                <StyledText className="text-xl font-bold text-gray-900 text-center">Friend Zone</StyledText>
                <StyledText className="text-base text-gray-400 text-center mt-1">โปรดอ่านเงื่อนไขและข้อตกลง</StyledText>
                {policyContent.map((item, index) => (
                    <StyledText key={index} className="text-base text-gray-700 mt-4">
                        {`${index + 1}. ${item}`}
                    </StyledText>
                ))}
                {/* <StyledTouchableOpacity
                    className="w-4/5 bg-gradient-to-r from-pink-500 to-orange-400 py-3 my-4 rounded-full self-center"
                    onPress={handleAgree}
                >
                    <StyledText className="text-center text-g text-lg font-semibold">I AGREE</StyledText>
                </StyledTouchableOpacity> */}

                <TouchableOpacity className="w-full mt-11"
                    onPress={handleAgree}>
                    <LinearGradient
                        colors={['#ec4899', '#f97316']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        className="rounded-full py-3 shadow-sm"
                    >
                        <StyledText className="text-center text-white text-lg font-semibold">I AGREE</StyledText>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </StyledView>
    );
}