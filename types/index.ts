import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeScreen: undefined;
  Agreement: { nextScreen: string }
  RegisterStepTwo: { username: string, password: string}
};

export type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
