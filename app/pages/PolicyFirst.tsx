import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import axios from 'axios'; // Import axios for API calls

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AgreementScreen() {
    const [policyContent, setPolicyContent] = useState<string[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);

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
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black h-full duration-500">
                <ActivityIndicator size="large" color="#0000ff" />
            </StyledView>
        );
    }

    if (error) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-white dark:bg-black h-full duration-500">
                <StyledText className="text-red-500">{error}</StyledText>
            </StyledView>
        );
    }

    return (
        <StyledView className="flex-auto justify-center items-center duration-500 bg-white dark:bg-black h-full">
            <ScrollView className="flex-1 w-4/5 mt-6 self-center">
                {/* Title Section */}
                <StyledText className="text-2xl font-bold text-gray-900 dark:text-white text-center duration-500">
                    ยินดีต้อนรับสู่
                </StyledText>
                <StyledText className="text-2xl font-bold text-gray-900 dark:text-white text-center duration-500">
                    Friend Zone
                </StyledText>
                <StyledText className="text-base text-gray-800 dark:text-white text-center mt-1 mb-5 duration-500">
                    โปรดอ่านเงื่อนไขและข้อตกลง
                </StyledText>

                {/* Policy Content */}
                {policyContent.map((item, index) => (
                    <StyledText key={index} className="text-base text-gray-800 dark:text-white mt-4 duration-500">
                        {`${index + 1}. ${item}`}
                    </StyledText>
                ))}

                {/* Agree Button */}
                <StyledTouchableOpacity
                    className="w-4/5 bg-gradient-to-r from-pink-500 to-orange-400 py-3 my-4 rounded-full self-center duration-500 shadow-lg"
                    onPress={() => {
                        // Handle the agree action here
                        console.log("User agreed to the terms");
                    }}
                >
                    <StyledText className="text-center text-white text-lg font-semibold">
                        I AGREE
                    </StyledText>
                </StyledTouchableOpacity>
            </ScrollView>
        </StyledView>
    );
}
