import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeScreen: undefined;
  Agreement: { nextScreen: string }
  RegisterStepTwo: { username: string, password: string }
  PostUpdate: {
    post: {
      id: string;
      content: string;
      images: string[];
      createdAt: string;
      member: {
        id: string;
        username: string;
        profileUrl: string;
        verified: boolean;
      }
    }
  },
  Search : {
    searchType : "Friend" | "Music" | "Dj"
  }
};

export type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
