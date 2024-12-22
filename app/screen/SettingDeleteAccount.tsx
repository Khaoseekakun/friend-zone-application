import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View, SafeAreaView, Platform, Appearance, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledIonIcon = styled(Ionicons);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SettingDeleteAccount() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [theme, setTheme] = useState(Appearance.getColorScheme());
    const [userData, setUserData] = useState<any>({});
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setUserData(JSON.parse(userData || '{}'));
        };
        fetchUserData();
        setPassword('')
    }, []);

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setTheme(colorScheme);
        });

        return () => listener.remove();
    }, []);

    const handleDeleteAccount = async () => {
        if (!password) return Alert.alert("ผิดพลาด", "กรุณากรอกรหัสผ่าน")
        try {
            setLoading(true)
            const response = await axios.put(`http://49.231.43.37:3000/api/account/${userData.id}`, {
                password: password
            }, {
                headers: {
                    Authorization: `All ${userData.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.data.code == "UNAUTHORIZED") {
                Alert.alert("ผิดพลาด", "รหัสผ่านไม่ถูกต้อง")
                // alert("รหัสผ่านไม่ถูกต้อง")
            } else if (response.data.data.code == "SUCCESS") {
                // alert("ลบบัญชีสำเร็จ")
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('userToken');
                const resetAction = StackActions.replace("Login")
                navigation.dispatch(resetAction);
            } else {
                //user not found
                Alert.alert("ผิดพลาด", "ไม่พบผู้ใช้งาน")
            }
        } catch (error) {
            console.log(error)
            // alert("เกิดข้อผิดพลาด")
            Alert.alert("ผิดพลาด", "เกิดข้อผิดพลาดขณะทำการตรวจสอบข้อมูล")
        } finally {

            setLoading(false)
        }
    }




    return (

        <StyledView className="flex-1 bg-gray-100 dark:bg-neutral-950 pt-3 px-2">
            <StyledView className={`flex-row justify-center items-center px-4 border-b border-neutral-200 dark:border-neutral-800 w-full ${Platform.OS === "ios" ? "h-[50px]" : "h-[80px]"}`}>
                <TouchableOpacity
                    className="absolute left-4"
                    onPress={() => navigation.navigate("SettingTab", {})}
                >
                    <StyledText className="font-custom text-gray-500 dark:text-white text-lg mt-6">
                        กลับ
                    </StyledText>
                </TouchableOpacity>

                <StyledText className="dark:text-white text-lg font-custom mt-6">
                    คำขอลบบัญชี
                </StyledText>
            </StyledView>

            <StyledView className="mt-4 space-y-4">
                <StyledView className="bg-white dark:bg-neutral-900 rounded-2xl p-6">
                    <LinearGradient
                        colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                        className="w-16 h-16 rounded-full items-center justify-center mb-4 self-center"
                    >
                        <StyledIonIcon name="trash-bin-outline" size={32} color="white" />
                    </LinearGradient>

                    <StyledText className="font-custom text-xl text-center text-neutral-800 dark:text-white mb-2">
                        คุณต้องการลบบัญชีของคุณหรือไม่
                    </StyledText>


                    <StyledView className="space-y-3">
                        <StyledView className="flex-row items-center">
                            <StyledText className="font-custom ml-3 text-red-700 dark:text-red-300">
                                การลบบัญชีจะทำให้ข้อมูลของคุณถูกลบทั้งหมด และไม่สามารถกู้คืนได้ คุณแน่ใจว่าต้องการลบบัญชีของคุณหรือไม่
                            </StyledText>
                        </StyledView>
                        <StyledView className="">
                            <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">
                                เราจะเก็บข้อมูลของคุณไว้เป็นเวลา 15 วัน
                            </StyledText>
                            <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300">
                                หากคุณต้องการกู้คืนบัญชีของคุณ
                            </StyledText>
                            <StyledTouchableOpacity onPress={() => { Linking.openURL('mailto:contact.friendszone@gmail.com'); }}>
                                <StyledText className="font-custom ml-3 text-neutral-700 dark:text-neutral-300 underline">
                                    ให้ติดต่อได้ที่ contact.friendszone@gmail.com
                                </StyledText>
                            </StyledTouchableOpacity>

                        </StyledView>
                    </StyledView>

                    <StyledTouchableOpacity
                        onPress={() => {
                            bottomSheetRef.current?.expand()
                        }}
                    >
                        <LinearGradient
                            colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                            className="w-full rounded-full items-center justify-center self-center py-2 mt-5"
                        >

                            <StyledText className="text-white text-center font-custom">
                                ยืนยันการลบบัญชี
                            </StyledText>
                        </LinearGradient>
                    </StyledTouchableOpacity>

                </StyledView>
            </StyledView>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={['60%']}
                enablePanDownToClose={loading == true ? false : true}
                backgroundStyle={{
                    borderRadius: 10,
                    backgroundColor: theme == "dark" ? "#404040" : "#fff"
                }}
            >
                <BottomSheetView>
                    <StyledView className="p-4">
                        <StyledText className="font-custom text-xl text-center text-neutral-800 dark:text-white mb-2">
                            ยืนยันรหัสผ่านของคุณ
                        </StyledText>
                        <StyledTextInput
                            className="border border-neutral-300 font-custom dark:border-neutral-800 rounded-lg p-2 mt-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white"
                            placeholder="รหัสผ่าน"
                            placeholderTextColor={theme === 'dark' ? '#A1A1AA' : '#6B7280'}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <StyledTouchableOpacity
                            onPress={handleDeleteAccount}
                            disabled={loading }
                            className="mt-4"
                        >
                            <LinearGradient
                                colors={theme === 'dark' ? ['#EB3834', '#69140F'] : ['#ec4899', '#f97316']}
                                className="w-full rounded-xl items-center justify-center self-center py-2"
                            >
                                {
                                    loading == true ?
                                        <ActivityIndicator size="small" color="#fff" />
                                        :
                                        <StyledText className="text-white text-center font-custom">
                                            ยืนยัน
                                        </StyledText>
                                }
                            </LinearGradient>
                        </StyledTouchableOpacity>
                    </StyledView>
                </BottomSheetView>
            </BottomSheet>
        </StyledView>
    );
}