import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Only one NavigationContainer here
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreenView from '../components/SplashScreenView';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeScreen from './pages/HomeScreen';

const Stack = createStackNavigator();

export default function Index() {
    const [isShowingSplash, setIsShowingSplash] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsShowingSplash(false);
        }, 3000);

        return () => clearTimeout(timer); // Clear the timer
    }, []);

    if (isShowingSplash) {
        return <SplashScreenView />;
    }

    return (
        <NavigationContainer independent={true}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} options={{headerShown:false}} />
            <Stack.Screen name="Register" component={Register} options={{headerShown:false}} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown:false}} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}
