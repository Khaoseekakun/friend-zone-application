import { StackNavigationProp } from '@react-navigation/stack';
import { Likes, MembersDB } from './prismaInterface';

export type RootStackParamList = {
  Login: {
    backPage?: string;
  },
  ForgotPassword: {
    backPage?: string;
  },
  SettingPassword: {
    backPage?: string;
  },
  Register: {
    backPage?: string;
  },
  HomeScreen: {
    backPage?: string;
  },
  History: {
    backPage?: string;
  },
  AccountStatus: {
    backPage?: string;
  },
  Agreement: { nextScreen?: string, backPage?: string },
  RegisterStepTwo: { username: string, password: string, backPage?: string },
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
    },
    backPage?: string;
  },
  Search: {
    searchType: "Friend" | "Music" | "Dj",
    backPage?: string;
  },
  SearchLoading: {
    searchType: "Friend" | "Music" | "Dj",
    backPage?: string;
  },
  Chat: {
    helper?: boolean
    chatId?: string,
    receiverId?: string,
    chatName: string,
    profileUrl?: string,
    backPage?: string;
  },
  MessageTab: {
    backPage?: string;
  },
  ProfileTab: {
    profileId: string,
    jobCategory?: string,
    backPage?: string,
    searchType?: string
    backData?: any
  },
  FeedsTab: {
    backPage?: string;
  },
  PostTab: {
    backPage?: string;
  },
  ProfileMember: {
    profileId: string,
    backPage?: string
  },
  SchedulePage: {
    backPage?: string;
  };
  ScheduleList: {
    backPage?: string;
  },
  SearchCategory: {
    backPage?: string;
  },
  Policy: {
    backPage?: string;
  },
  SettingImagePreview: {
    backPage?: string;
  },
  SettingImagePreviewFirst: {
    backPage?: string;
  },
  PostView: {
    backPage?: string;
    item: Post
  },
  SettingTab: {
    backPage?: string
  },
  Notification: {
    backPage?: string
  },
  SelectRegisterPage : {
    backPage?: string
  },
  RegisterMember: {
    backPage?: string
  }
};

export type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Post {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  member: MembersDB
  _count: {
    comments: number,
    likes: number
  }
  likes: Likes[]
}
