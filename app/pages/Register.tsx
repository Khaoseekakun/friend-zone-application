import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_SYSTEM_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzeXN0ZW0iOnRydWUsInBlcm1pc3Npb25zIjp7Ik1hbmFnZU90cCI6dHJ1ZSwiTm90aWZpY2F0aW9ucyI6dHJ1ZSwiTWFuYWdlQWRtaW5zIjp0cnVlLCJNYW5hZ2VQYXltZW50cyI6dHJ1ZSwiTWFuYWdlQ3VzdG9tZXIiOnRydWUsIk1hbmFnZU1lbWJlcnMiOnRydWUsIk1hbmFnZVBvc3RzIjp0cnVlLCJNYW5hZ2VTY2hlZHVsZSI6dHJ1ZSwiTWFuYWdlU2V0dGluZ3MiOnRydWV9LCJpYXQiOjE3MjY5NTIxODN9.LZqnLm_8qvrL191MV7OIpUSczeFgGupOb5Pp2UOvyTE';
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback)
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
    <StyledText className={`font-custom text-sm ${wrong == true ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} mb-2 ml-4 absolute -mt-3 bg-white dark:bg-neutral-900 z-50 px-2`}>{label}</StyledText>
    <StyledView className="font-custom w-full relative">
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
            className={`font-custom border ${wrong == true ? 'border-red-500' : 'border-gray-300'} rounded-full py-4 px-4 ${wrong == true ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} w-full pr-12`}
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
  const [isUsernameValid, setIsUsernameValid] = useState(false as boolean | null);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const [pageLoading, setPageLoading] = useState(true);

  useFocusEffect(() => {
    AsyncStorage.getItem('userToken').then(token => {
      if (token) {
        navigation.navigate('HomeScreen', {});
      } else {
        setPageLoading(false);
      }
    });
  })

  if (pageLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EB3834" />
      </View>
    );
  }

  const handleCheckPassword = (value: string) => {
    setConfirmPassword(value);
    setIsPasswordMatch(password === value); // Simplified condition
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const onCheckUsername = (value: string) => {
    const englishRegex = /^[A-Za-z0-9_]*$/;
    setIsUsernameValid(null)
    if (!englishRegex.test(value)) {
      //delete 1 letter from username
      setUsername(value.slice(0, -1));
      return;
    } else {
      setUsername(value);
    }
  }

  const handleCheckUsername = async () => {


    try {
      const userChecker = await axios.get(`https://friendszone.app/api/customer?username=${username}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `System ${API_SYSTEM_KEY}`,
        },
      });
      setIsUsernameValid(userChecker.data.status == 200);
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }
  };

  const handleRegister = () => {
    if (username === '') {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    // allow A-Z, a-z, o-9 and _
    if (!/^[A-Za-z0-9_]*$/.test(username)) {
      alert('ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษเท่านั้น');
      return;
    }

    if (password.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (confirmPassword === '') {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    if (!isPasswordMatch) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    // Navigate to the next step
    navigation.navigate('RegisterStepTwo', { username, password });
  };

  return (

    <StyledTouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
    }}>
      <StyledView className='flex-1 bg-white dark:bg-neutral-900 h-full pt-[20%]'>
      <StyledView className="flex-1 px-6">
        <TouchableOpacity onPress={() => navigation.navigate('SelectRegisterPage', {})} className="mt-6">
          <Ionicons name="chevron-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>

        <StyledView className="flex items-center">
          <StyledText className="font-custom text-3xl font-bold text-[#1e3a8a] mt-6 mb-2">สร้างบัญชี</StyledText>
          <StyledText className="font-custom text-base text-gray-400">สร้างบัญชีของคุณเพื่อเริ่มต้นการใช้งาน</StyledText>
        </StyledView>

        <StyledView className="flex-1 top-8">

          <StyledView className="space-y-6 ">
            <InputField
              label={(username.length <= 2 && username.length !== 0) ? 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' : isUsernameValid ? 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' : 'ชื่อผู้ใช้'}
              placeholder="ชื่อผู้ใช้ของคุณ"
              value={username}
              onChangeText={onCheckUsername}
              onBlur={handleCheckUsername}
              wrong={isUsernameValid !== null && isUsernameValid}
            />

            <InputField
              label={(password.length <= 5 && password.length !== 0) ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'รหัสผ่าน'}
              placeholder="รหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            <InputField
              label={isPasswordMatch ? 'ยืนยันรหัสผ่าน' : 'รหัสผ่านไม่ตรงกัน'}
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChangeText={handleCheckPassword}
              secureTextEntry={!isPasswordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
              wrong={!isPasswordMatch}
            />
          </StyledView>

          <TouchableOpacity className="w-full " onPress={handleRegister} disabled={!isPasswordMatch || isUsernameValid || isUsernameValid == null}>
            <LinearGradient
              colors={!isPasswordMatch || isUsernameValid || isUsernameValid == null ? ['#ccc', '#ccc'] : ['#ec4899', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full py-3 shadow-sm"
            >
              <StyledText className="font-custom text-center text-white text-lg font-semibold">ถัดไป</StyledText>
            </LinearGradient>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
      </StyledView>
    </StyledTouchableWithoutFeedback >
  );
}