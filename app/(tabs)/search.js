import { StatusBar } from "expo-status-bar";
// import { StyleSheet, Text, View } from "react-native";
import { Text, View } from "react-native";

export default function App() {
  return (
    // <View style={styles.container}>
    <View className='flex-1 justify-center items-center bg-gray-500'>
      <Text className='text-white'>SEARCH PAGE</Text>
      <StatusBar style='auto' />
    </View>
  );
}