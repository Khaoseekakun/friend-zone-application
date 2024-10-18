import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const Navigation = () => {
  return (
    <View className="flex-row justify-around items-center bg-black max-h-[4.4rem] px-6 rounded-t-xl shadow-lg absolute bottom-0 left-0 right-0 h-16 pb-1">
      <TouchableOpacity className="flex-1 justify-center items-center">
        <Text className="text-slate-50">Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Navigation;
