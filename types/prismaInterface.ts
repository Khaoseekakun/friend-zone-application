export interface MembersDB {
    id: string;
    username: string;
    token: string;
    firstname: string;
    lastname: string;
    gender: string;
    gmail?: string | null;
    password: string;
    resetFirstPassword: boolean;
    verified: boolean;
    phoneNumber?: string | null;
    profileUrl?: string | null;
    updatedAt: Date;
    createdAt: Date;
    deleted: boolean;
    schedules: Schedule[];
    province: string[];
    birthday?: Date | null;
    post: Post[];
    MessagesChat: MessagesChat[];
    pinLocation: number[];
    bio?: string | null;
    rating: number;
    JobMembers: JobMembers[];
    reviews: number;
    weight: number;
    height: number;
    previewFirstImageUrl?: string | null;
    previewAllImageUrl: string[];
    Comments: Comments[];
  }
  
  export interface CustomersDB {
    id: string;
    username: string;
    token: string;
    firstname?: string | null;
    lastname?: string | null;
    gender: string;
    phoneNumber?: string | null;
    password: string;
    gmail?: string | null;
    verified: boolean;
    updatedAt: Date;
    createdAt: Date;
    deleted: boolean;
    schedules: Schedule[];
    province: string[];
    birthday?: Date | null;
    profileUrl?: string | null;
    MessagesChat: MessagesChat[];
    stripeUserId?: string | null;
    pinLocation: string[];
    bio?: string | null;
    weight: number;
    height: number;
    previewAllImageUrl: string[];
    Comments: Comments[];
  }
  
  export interface Post {
    id: string;
    content?: string | null;
    memberId: string;
    member: MembersDB;
    images: string[];
    updatedAt: Date;
    createdAt: Date;
    likes: Likes[];
    comments: Comments[];
  }
  
  export interface Likes {
    id: string;
    author: string;
    updatedAt: Date;
    createdAt: Date;
    Post?: Post | null;
    postId?: string | null;
  }
  
  export interface Comments {
    id: string;
    accountType?: string | null;
    customer?: CustomersDB | null;
    member?: MembersDB | null;
    updatedAt: Date;
    createdAt: Date;
    Post?: Post | null;
    postId?: string | null;
    customersDBId?: string | null;
    membersDBId?: string | null;
    content: string;
  }
  
  export interface Schedule {
    id: string;
    customer: CustomersDB;
    customerId: string;
    member: MembersDB;
    memberId: string;
    status: string;
    rejectReason?: string | null;
    updatedAt: Date;
    createdAt: Date;
    deleted: boolean;
  }
  
  export interface PhoneVerify {
    id: string;
    phone: string;
    code: string;
    timeout: Date;
    updatedAt: Date;
    createdAt: Date;
  }
  
  export interface Policy {
    id: string;
    content: string;
    updatedAt: Date;
    createdAt: Date;
  }
  
  export interface AllUsers {
    id: string;
    data_id: string;
    phoneNumber: string;
    type: string;
  }
  
  export interface JobMembers {
    id: string;
    jobs: JobsList;
    jobId: string;
    MembersDB?: MembersDB | null;
    memberId?: string | null;
  }
  
  export interface JobsList {
    id: string;
    jobName: string;
    jobCategory: JobCategory;
    jobCategoryId: string;
    JobMembers: JobMembers[];
  }
  
  export interface JobCategory {
    id: string;
    categoryName: string;
    JobsList: JobsList[];
  }
  
  export interface MessagesChat {
    id: string;
    Member: MembersDB;
    Customer: CustomersDB;
    memberId: string;
    customerId: string;
    messageStatus: string;
  }
  
  export interface LoginSession {
    id: string;
    userId: string;
    status: string;
    deviceId: string;
    notifyToken?: string | null;
    updatedAt: Date;
  }
  