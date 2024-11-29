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
AppRegistry.registerComponent("Firend Zone", () => App);

export default function App() {


    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = Font.useFonts({
        'Kanit': require('../assets/fonts/Kanit-Medium.ttf'),
    });


    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync(Entypo.font);
                await new Promise(resolve => setTimeout(resolve, 5000));

                const requestLocationPermission = async () => {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        setHasLocationPermission(true);
                    } else {
                        Alert.alert(
                            'คำเตือน',
                            'แอพพลิเคชั่นต้องการเข้าถึงตำแหน่งของคุณหากคุณไม่อนุญาต \nคุณจะไม่สามารถใช้งานบางระบบได้',
                            [{ text: 'ฉันเข้าใจ', style: 'destructive' }]
                        );

                        setHasLocationPermission(false);
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


