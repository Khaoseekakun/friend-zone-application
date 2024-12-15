export enum UserType {
  Admin = "Admin",
  Member = "Member",
  Customer = "Customer"
}

export interface MembersDB {
  id: string;
  username: string;
  token: string;
  firstname: string;
  lastname: string;
  gender: string;
  gmail?: string;
  password: string;
  resetFirstPassword: boolean;
  verified: boolean;
  phoneNumber?: string;
  profileUrl?: string;
  updatedAt: Date;
  createdAt: Date;
  deleted: boolean;
  province: string[];
  birthday?: Date;
  pinLocation: number[];
  bio?: string;
  rating: number;
  reviews: number;
  weight: number;
  height: number;
  previewFirstImageUrl?: string;
  previewAllImageUrl: string[];
  loggedAt?: string;
  schedules: Schedule[];
  post: Post[];
  MessagesChat: MessagesChat[];
  Comments: Comments[];
  JobMembers: JobMembers[];
  Warning: Warning[];
  Review: Review[];
}

export interface Review {
  id: string;
  text: string;
  star: number;
  updatedAt: Date;
  createdAt: Date;
  customerId?: string;
  memberId?: string;
  CustomerDB?: CustomersDB;
  MemberDB?: MembersDB;
  userType: UserType;
}

export interface CustomersDB {
  id: string;
  username: string;
  token: string;
  firstname?: string;
  lastname?: string;
  gender: string;
  phoneNumber?: string;
  password: string;
  gmail?: string;
  verified: boolean;
  updatedAt: Date;
  createdAt: Date;
  deleted: boolean;
  province: string[];
  birthday?: Date;
  profileUrl?: string;
  stripeUserId?: string;
  pinLocation: number[];
  bio?: string;
  weight: number;
  height: number;
  previewAllImageUrl: string[];
  Comments: Comments[];
  MessagesChat: MessagesChat[];
  schedules: Schedule[];
  Warning: Warning[];
  loggedAt?: string;
  Review: Review[];
}

export interface Warning {
  id: string;
  content: string;
  updatedAt: Date;
  createdAt: Date;
  customer: CustomersDB;
  customerId: string;
  member: MembersDB;
  memberId: string;
}

export interface RegisterMemberData {
  id: string;
  username: string;
  gmail?: string;
  password: string;
  phoneNumber?: string;
  registerType?: string;
  firstname?: string;
  lastname?: string;
  age: number;
  gender: string;
  address?: string;
  hotlinePhone?: string;
  hotlineName?: string;
  verifyCardTHID?: string;
  verifyFaceTHID?: string;
  BankAccount: BankAccount[];
  updatedAt: Date;
  createdAt: Date;
  status: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNo: string;
  bankName: string;
  bankId: string;
  memberId: string;
  RegisterMemberData?: RegisterMemberData;
  registerMemberDataId?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface BankList {
  id: string;
  bankName: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Post {
  id: string;
  content?: string;
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
  Post?: Post;
  postId?: string;
}

export interface Comments {
  id: string;
  accountType?: string;
  customer?: CustomersDB;
  member?: MembersDB;
  updatedAt: Date;
  createdAt: Date;
  postId?: string;
  content: string;
  customersDBId?: string;
  membersDBId?: string;
  Post?: Post;
}

export interface Schedule {
  id: string;
  customer: CustomersDB;
  customerId: string;
  member: MembersDB;
  memberId: string;
  status: string;
  rejectReason?: string;
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
  MembersDB?: MembersDB;
  memberId?: string;
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
  serviceRate: ServiceRate[];
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
  notifyToken?: string;
  updatedAt: Date;
}

export interface ServiceRate {
  id: string;
  start: number;
  start_per_hour: number;
  off_time: number;
  off_time_per_hour: number;
  jobCategory?: JobCategory;
  jobCategoryId?: string;
}

export interface ServiceDistanceRate {
  id: string;
  distance: number;
  price: number;
}
