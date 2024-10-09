'use client'
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import LoadingScreen from '../../components/LoadScreen'; // Your loading component

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Wait for 3 seconds before removing the loading screen

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className='text-back'>HOME PAGE</Text>
    </View>
  );
};

export default App;
