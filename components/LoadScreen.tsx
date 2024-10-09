import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const LoadingScreen = () => {
  return (
    <StyledView className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0000ff" />
      <StyledText className="mt-4 text-lg text-gray-500">Loading...</StyledText>
    </StyledView>
  );
};

export default LoadingScreen;
