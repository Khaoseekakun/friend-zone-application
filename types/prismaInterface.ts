export enum UserType {
  Admin = "Admin",
  Member = "Member",
  Customer = "Customer",
}

export interface Province {
  id: string;
  name: string;
  MembersDB: MembersDB[];
  CustomersDB: CustomersDB[];
  updatedAt: Date;
  createdAt: Date;
  status: boolean;
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
  emailVerified: boolean;
  phoneNumber?: string;
  profileUrl?: string;
  updatedAt: Date;
  createdAt: Date;
  deleted: boolean;
  birthday?: Date;
  pinLocation: number[];
  bio?: string;
  rating: number;
  reviews: number;
  weight: number;
  height: number;
  previewVideoUrl?: string;
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
  BankAccount: BankAccount[];
  jobCategory?: JobCategory;
  jobCategoryId?: string;
  status: string;
  Province?: Province;
  provinceId?: string;
}

export interface Review {
  id: string;
  text: string;
  star: number;
  updatedAt: Date;
  createdAt: Date;
  reviewUserId: string;
  customerId?: string;
  memberId?: string;
  MemberDB?: MembersDB;
  userType: UserType;
  CustomersDB?: CustomersDB;
  customersDBId?: string;
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
  emailVerified: boolean;
  updatedAt: Date;
  createdAt: Date;
  deleted: boolean;
  birthday?: Date;
  profileUrl?: string;
  stripeUserId?: string;
  pinLocation: number[];
  bio?: string;
  weight: number;
  height: number;
  previewVideoUrl?: string;
  previewAllImageUrl: string[];
  Comments: Comments[];
  MessagesChat: MessagesChat[];
  schedules: Schedule[];
  Warning: Warning[];
  loggedAt?: string;
  Review: Review[];
  Province?: Province;
  provinceId?: string;
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
  memberId: string;
  RegisterMemberData?: RegisterMemberData;
  registerMemberDataId?: string;
  Member?: MembersDB;
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
  MembersDB: MembersDB[];
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

export interface GmailOtp {
  id: string;
  gmail: string;
  otp: string;
  updatedAt: Date;
  createdAt: Date;
  timeout: Date;
}
