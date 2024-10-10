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
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}
