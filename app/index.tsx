import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStepTwo from './pages/RegisterStepTwo';
import PolicyFirst from './pages/PolicyFirst';
import HomeScreen from './pages/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false}}>
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="RegisterStepTwo" component={RegisterStepTwo} />
                <Stack.Screen name="Agreement" component={PolicyFirst} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}