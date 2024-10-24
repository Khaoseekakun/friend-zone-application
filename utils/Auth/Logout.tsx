import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Updates from 'expo-updates'

export async function Logout(){
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userToken');
    await Updates.reloadAsync(); 
}