import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreenView from '../components/SplashScreenView';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeScreen from './pages/HomeScreen';
import PolicyFirst from './pages/PolicyFirst';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, SafeAreaView } from 'react-native';

const Stack = createStackNavigator();

export default function Index() {
    const [isShowingSplash, setIsShowingSplash] = React.useState(true);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [hasAgreedToPolicy, setHasAgreedToPolicy] = React.useState(false);

    const checkLoginAndPolicy = async () => {
        try {
            const loggedIn = await AsyncStorage.getItem('isLoggedIn');
            const agreedToPolicy = await AsyncStorage.getItem('hasAgreedToPolicy');

            setIsLoggedIn(loggedIn === 'true');
            setHasAgreedToPolicy(agreedToPolicy === 'true');
        } catch (error) {
            console.log('Error reading login/policy state:', error);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsShowingSplash(false);
        }, 3000);

        checkLoginAndPolicy();

        return () => clearTimeout(timer);
    }, []);

    if (isShowingSplash) {
        return (
            <>
                <SplashScreenView />
            </>
        );
    }

    return (
        <>
            <NavigationContainer independent={true}>
                <Stack.Navigator initialRouteName={isLoggedIn ? (hasAgreedToPolicy ? 'HomeScreen' : 'Agreement') : 'Login'} screenOptions={{ headerShown: false, animationTypeForReplace:'push' }}>
                    <Stack.Screen name="Login" component={Login}/>
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="Agreement" component={PolicyFirst} />
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
