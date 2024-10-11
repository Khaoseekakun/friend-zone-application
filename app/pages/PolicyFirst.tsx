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
            {/* Scrollable Policy Content */}
            <ScrollView className="flex-1 w-4/5 mt-6 self-center">
                <StyledText className="text-xl font-bold text-gray-900 text-center">ยินดีต้อนรับสู่</StyledText>
                <StyledText className="text-xl font-bold text-gray-900 text-center">Friend Zone</StyledText>
                <StyledText className="text-base text-gray-400 text-center mt-1">โปรดอ่านเงื่อนไขและข้อตกลง</StyledText>
    
                {/* Display the policy content fetched from the API */}
                {policyContent.map((item, index) => (
                    <StyledText key={index} className="text-base text-gray-700 mt-4">
                        {`${index + 1}. ${item}`}
                    </StyledText>
                ))}

                
    
            {/* Agree Button */}
            <StyledTouchableOpacity
                className="w-4/5 bg-gradient-to-r from-pink-500 to-orange-400 py-3 my-4 rounded-full self-center"
                onPress={() => {
                    // Handle the agree action here, such as navigating to the next screen
                    console.log("User agreed to the terms");
                }}
                
            >
                <StyledText className="text-center text-white text-lg font-semibold">I AGREE</StyledText>
            </StyledTouchableOpacity>
            </ScrollView>
        </StyledView>
    );
    
}
