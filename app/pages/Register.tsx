import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, InputModeOptions } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);

interface InputFieldProps {
  label: string;
  placeholder: string;
  inputMode?: InputModeOptions
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  placeholder, 
  value, 
  inputMode, 
  onChangeText, 
  onPress, 
  editable = true, 
  buttonText, 
  onButtonPress 
}) => (
  <StyledView className="w-full mb-7">
    <StyledText className="text-sm text-gray-600 mb-2 ml-4 absolute -mt-3 bg-white z-50 px-2">{label}</StyledText>
    <StyledView className="flex-row items-center">
      <StyledTextInput
        placeholder={placeholder}
        className={`border border-gray-300 rounded-full py-4 px-4 text-gray-700 ${buttonText ? 'flex-1 mr-2' : 'w-full'}`}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
        editable={editable}
        onPressIn={onPress}
        inputMode={inputMode}
      />
      {buttonText && (
        <TouchableOpacity 
          onPress={onButtonPress} 
        >
          <LinearGradient
          colors={['#ec4899','#f97316' ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-full py-3 px-4">
            <StyledText className="text-white text-center">{buttonText}</StyledText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </StyledView>
  </StyledView>
);

export default function Register() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [province, setProvince] = useState('');
  const [phone, setPhone] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const formattedDate = date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    setBirthdate(formattedDate);
    hideDatePicker();
  };

  const handlePhoneVerification = () => {
    console.log("กำลังยืนยันหมายเลขมือถือ:", phone);
    alert(`กำลังส่งรหัสยืนยันไปที่หมายเลข ${phone}`);
  };

  return (

    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StyledSafeAreaView className="flex-1 bg-white">
          <StyledView className="flex-1 px-6">
            <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
              <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
            </TouchableOpacity>

            <StyledView className="flex items-center mb-10">
              <StyledText className="text-3xl font-bold text-[#1e3a8a] mt-6 mb-2">สร้างบัญชี</StyledText>
              <StyledText className="text-base text-gray-400 mb-8">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>
            </StyledView>

            <StyledView className="space-y-6">
              <InputField label="ชื่อผู้ใช้" placeholder="ชื่อผู้ใช้ของคุณ" inputMode="text" value={username} onChangeText={setUsername} />
              <InputField label="เพศ" placeholder="เพศของคุณ" inputMode="text" value={gender} onChangeText={setGender} />
              <InputField
                label="วันเกิด"
                placeholder="เลือกวันเกิดของคุณ"
                value={birthdate}
                onChangeText={setBirthdate}
                onPress={showDatePicker}
                editable={false}
              />
              <InputField label="จังหวัด" placeholder="เลือกจังหวัดของคุณ" inputMode="text" value={province} onChangeText={setProvince} />
              
            </StyledView>

            <TouchableOpacity className="w-full mt-8" onPress={() => navigation.navigate('RegisterS')}
            >
              <LinearGradient
                colors={['#ec4899', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full py-3 shadow-sm"
              >
                <StyledText className="text-center text-white text-lg font-semibold">ถัดไป</StyledText>
              </LinearGradient>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              locale='th-TH'
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
            />
          </StyledView>
        </StyledSafeAreaView>
      </KeyboardAvoidingView>

    </>
  );
}