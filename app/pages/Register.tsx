import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select'; 
import axios from 'axios';
const API_SYSTEM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzeXN0ZW0iOnRydWUsInBlcm1pc3Npb25zIjp7Ik1hbmFnZU90cCI6dHJ1ZSwiTm90aWZpY2F0aW9ucyI6dHJ1ZSwiTWFuYWdlQWRtaW5zIjp0cnVlLCJNYW5hZ2VQYXltZW50cyI6dHJ1ZSwiTWFuYWdlQ3VzdG9tZXIiOnRydWUsIk1hbmFnZU1lbWJlcnMiOnRydWUsIk1hbmFnZVBvc3RzIjp0cnVlLCJNYW5hZ2VTY2hlZHVsZSI6dHJ1ZSwiTWFuYWdlU2V0dGluZ3MiOnRydWV9LCJpYXQiOjE3MjY5NTIxODN9.LZqnLm_8qvrL191MV7OIpUSczeFgGupOb5Pp2UOvyTE';
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  buttonText?: string;
  onButtonPress?: () => void;
  isPicker?: boolean;
  pickerItems?: { label: string; value: string }[];
  onBlur?: () => void;
  wrong?: boolean;
  secureTextEntry?: boolean;
  togglePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onPress,
  isPicker = false,
  pickerItems,
  onBlur,
  wrong,
  secureTextEntry,
  togglePasswordVisibility,
  isPasswordVisible
}) => (
  <StyledView className="w-full mb-7">
    <StyledText className={`text-sm ${wrong == true ? 'text-red-500' : 'text-gray-600'} mb-2 ml-4 absolute -mt-3 bg-white z-50 px-2`}>{label}</StyledText>
    <StyledView className="w-full relative">
      {isPicker && pickerItems ? (
        <RNPickerSelect
          onValueChange={onChangeText}
          items={pickerItems}
          value={value}
          placeholder={{ label: placeholder, value: null }}
          style={{
            inputIOS: { padding: 16, borderWidth: 1, borderRadius: 25, borderColor: '#ccc', color: '#333', width: '100%' },
            inputAndroid: { padding: 16, borderWidth: 1, borderRadius: 25, borderColor: '#ccc', color: '#333', width: '100%' }
          }}
        />
      ) : (
        <>
          <StyledTextInput
            placeholder={placeholder}
            className={`border ${wrong == true ? 'border-red-500' : 'border-gray-300'} rounded-full py-4 px-4 ${wrong == true ? 'text-red-500' : 'text-gray-600'} w-full pr-12`}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholderTextColor="#9CA3AF"
            onPressIn={onPress}
            secureTextEntry={secureTextEntry}
            textContentType="oneTimeCode"
          />
          {togglePasswordVisibility && (
            <TouchableOpacity onPress={togglePasswordVisibility} className="absolute right-4 top-3">
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </StyledView>
  </StyledView>
);

export default function Register() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true); // State to track password match
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const [error, setError] = useState('');

  // Function to check if passwords match
  const handleCheckPassword = () => {
    if (password !== confirmPassword) {
      setIsPasswordMatch(false); 
    } else {
      setIsPasswordMatch(true); 
    }
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };


  const handleCheckUsername = async () => {
    try {
      const userChecker = await axios.get(
        `http://49.231.43.37:3000/api/customer?username=${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              `System ${API_SYSTEM_KEY}`,
          },
        }
      );
      if (userChecker.data.status === 200) {
        setIsUsernameValid(true); 
      } else {
        setIsUsernameValid(false); 
      }
    } catch (error: any) {
      console.log(error);
      setError(error);
    }
  };

  // Register handler
  const handleRegister = () => {
    // Check if username is empty
    if (username === '') {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    // Check if username is in English only
    if (!/^[a-zA-Z0-9]*$/.test(username)) {
      alert('ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษเท่านั้น');
      return;
    }

    if (confirmPassword === '') {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    // Continue registration if everything is valid
    navigation.navigate('RegisterStepTwo', { username: username, password: password });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StyledSafeAreaView className="flex-1 bg-white h-full">
        <StyledView className="flex-1 px-6">
          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>

          <StyledView className="flex items-center mb-10">
            <StyledText className="text-3xl font-bold text-[#1e3a8a] mt-6 mb-2">สร้างบัญชี</StyledText>
            <StyledText className="text-base text-gray-400 mb-8">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>
          </StyledView>

          <StyledView className="space-y-6">
            <InputField
              label={isUsernameValid ? 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' : 'ชื่อผู้ใช้'}
              placeholder="ชื่อผู้ใช้ของคุณ"
              value={username}
              onChangeText={setUsername}
              onBlur={handleCheckUsername}
              wrong={isUsernameValid}
            />

            <InputField
              label='รหัสผ่าน'
              placeholder="รหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              onBlur={handleCheckPassword}
              secureTextEntry={!isPasswordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            <InputField
              label={isPasswordMatch ? 'ยืนยันรหัสผ่าน' : 'รหัสผ่านไม่ตรงกัน'}
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={handleCheckPassword}
              secureTextEntry={!isPasswordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
              wrong={!isPasswordMatch}
            />
          </StyledView>

          <TouchableOpacity className="w-full mt-8" onPress={handleRegister} disabled={(!isPasswordMatch || isUsernameValid)}>
            <LinearGradient
              colors={(!isPasswordMatch || isUsernameValid) ?  ['#ccc', '#ccc'] : ['#ec4899', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full py-3 shadow-sm"
            >
              <StyledText className="text-center text-white text-lg font-semibold">ถัดไป</StyledText>
            </LinearGradient>
          </TouchableOpacity>

        </StyledView>
      </StyledSafeAreaView>
    </KeyboardAvoidingView>
  );
}
