import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../../app/pages/SplashScreen';
import Login from '../../app/pages/Login';
import Register from '../../app/pages/Register';
import RegisterStepTwo from '../../app/pages/RegisterStepTwo';
import PolicyFirst from '../../app/pages/PolicyFirst';
import HomeScreen from '../../app/pages/HomeScreen';
import React from 'react';
import SelectRegisterPage from '@/app/pages/SelectRegisterPage';
import RegisterMember from '@/app/pages/RegisterMember';

const Stack = createStackNavigator();
export function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <>
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="RegisterStepTwo" component={RegisterStepTwo} />
                <Stack.Screen name="Agreement" component={PolicyFirst} />
                <Stack.Screen name="SelectRegisterPage" component={SelectRegisterPage} />
                <Stack.Screen name="RegisterMember" component={RegisterMember} />
            </>
        </Stack.Navigator>
    );
}
