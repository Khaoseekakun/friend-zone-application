import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../utils/context/AuthContext'; // Import AuthProvider
import { AppNavigator } from '@/components/Navigator/App';
import 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { Entypo } from '@expo/vector-icons';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent("Firend Zone", () => App);

export default function App() {

    

    const [appIsReady, setAppIsReady] = useState(false);

    const [fontsLoaded] = Font.useFonts({
        'Kanit': require('../assets/fonts/Kanit-Medium.ttf'),
    });

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync(Entypo.font);
                await new Promise(resolve => setTimeout(resolve, 5000));
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
