import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeScreen: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
