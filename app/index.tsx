import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../utils/context/AuthContext'; // Import AuthProvider
import { AppNavigator } from '@/components/Navigator/App';
import 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { Entypo } from '@expo/vector-icons';
import { Alert, AppRegistry } from 'react-native';
import * as Location from 'expo-location';

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

        prepare();
    }, []);

    if (!appIsReady) {
        return null;
    }

    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}
