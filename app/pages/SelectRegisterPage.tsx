import { RootStackParamList } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View, SafeAreaView } from "react-native";

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledIonicons = styled(Ionicons)
const StyledSafeAreaView = styled(SafeAreaView)

export default function SelectRegisterPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <StyledSafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Header */}
      <StyledView className="flex-row items-center px-4 mt-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800"
        >
          <StyledIonicons name="chevron-back" size={24} className="text-black dark:text-neutral-200" />
        </TouchableOpacity>
      </StyledView>

      {/* Main Content */}
      <StyledView className="flex-1 px-6">
        {/* Title Section */}
        <StyledView className="mt-8">
          <StyledText className="font-custom text-3xl font-bold text-gray-900 dark:text-white text-center">
            Friend Zone
          </StyledText>
          <StyledText className="font-custom text-base text-gray-600 dark:text-gray-400 text-center mt-2">
            สมัครการใช้บริการ
          </StyledText>
        </StyledView>
        
        <StyledView className="items-center justify-center my-12">
        </StyledView>

        {/* Buttons Section */}
        <StyledView className="space-y-4 px-4">
          <TouchableOpacity
            onPress={() => navigation.navigate("Register", {})}
            className="w-full"
          >
            <StyledView className="bg-red-500 rounded-2xl p-4 shadow-sm">
              <StyledText className="text-center text-white font-custom text-lg font-semibold">
                สมัครเป็นผู้ใช้
              </StyledText>
              <StyledText className="text-center text-red-100 font-custom text-sm mt-1">
                สำหรับผู้ที่ต้องการใช้งานทั่วไป
              </StyledText>
            </StyledView>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterMember", {})}
            className="w-full"
          >
            <StyledView className="bg-white dark:bg-neutral-800 border-2 border-red-500 rounded-2xl p-4">
              <StyledText className="text-center text-red-500 font-custom text-lg font-semibold">
                สมัครเป็นสมาชิก
              </StyledText>
              <StyledText className="text-center text-gray-500 dark:text-gray-400 font-custom text-sm mt-1">
                สำหรับผู้ที่ต้องการเป็นmemberกับเรา
              </StyledText>
            </StyledView>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}