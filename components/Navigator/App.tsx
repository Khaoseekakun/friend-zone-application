import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../../app/pages/SplashScreen';
import Login from '../../app/pages/Login';
import Register from '../../app/pages/Register';
import RegisterStepTwo from '../../app/pages/RegisterStepTwo';
import PolicyFirst from '../../app/pages/PolicyFirst';
import HomeScreen from '../../app/pages/HomeScreen';
import { useAuth } from '@/utils/context/AuthContext';
import React from 'react';

const Stack = createStackNavigator();

export function AppNavigator() {
    const { userToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
            </Stack.Navigator>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
            ) : (
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="RegisterStepTwo" component={RegisterStepTwo} />
                    <Stack.Screen name="Agreement" component={PolicyFirst} />
                </>
            )}
        </Stack.Navigator>
    );
}
