import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../utils/context/AuthContext';
import { AppNavigator } from '@/components/Navigator/App';
import 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { Entypo } from '@expo/vector-icons';
import { Alert, AppRegistry } from 'react-native';
import * as Location from 'expo-location';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import ErrorBoundary from '@/utils/ErrorBoundary';

export default function App() {

    const [appIsReady, setAppIsReady] = useState(false);
    async function prepare() {
        try {
            await Font.loadAsync({
                'Kanit': require('../assets/fonts/Kanit-Medium.ttf'),
                ...Entypo.font,
            });
            await new Promise(resolve => setTimeout(resolve, 5000));

            const requestLocationPermission = async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status != 'granted') {
                    Alert.alert(
                        'คำเตือน',
                        'แอพพลิเคชั่นต้องการเข้าถึงตำแหน่งของคุณหากคุณไม่อนุญาต \nคุณจะไม่สามารถใช้งานบางระบบได้',
                        [{ text: 'ฉันเข้าใจ', style: 'destructive' }]
                    );
                } 
            };

            requestLocationPermission();
        } catch (e) {
            console.warn(e);
        } finally {
            setAppIsReady(true);
        }
    }

    const DeviceUUID = async () => {
        try {
            let storedUuid = await AsyncStorage.getItem('uuid');
            if (!storedUuid) {
                storedUuid = uuidv4();
                await AsyncStorage.setItem('uuid', storedUuid);
            }
        } catch (error) {
            console.error('Error fetching or generating UUID:', error);
        }
    }
    
    useEffect(() => {
        
        DeviceUUID();
        prepare();
    }, []);

    if (!appIsReady) {
        return null;
    }

    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </ErrorBoundary>
    );
}

AppRegistry.registerComponent("Friend Zone", () => App);


