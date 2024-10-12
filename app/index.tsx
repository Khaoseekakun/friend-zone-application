import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Only one NavigationContainer here
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreenView from '../components/SplashScreenView';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeScreen from './pages/HomeScreen';
import PolicyFirst from './pages/PolicyFirst'; // Import your Policy Agreement page
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage for caching

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
        return <SplashScreenView />;
    }
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName={isLoggedIn ? (hasAgreedToPolicy ? 'HomeScreen' : 'Agreement') : 'Login'}> 
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
                <Stack.Screen name="Agreement" component={PolicyFirst} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
