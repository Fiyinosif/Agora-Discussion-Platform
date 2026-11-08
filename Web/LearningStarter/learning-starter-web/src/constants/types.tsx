//This type uses a generic (<T>).  For more information on generics see: https://www.typescriptlang.org/docs/handbook/2/generics.html

import { ReactionGetDto } from "../config/reactions";

//You probably wont need this for the scope of this class :)
export type ApiResponse<T> = {
  data: T;
  errors: ApiError[];
  hasErrors: boolean;
};

export type ApiError = {
  property: string;
  message: string;
};

export type AnyObject = {
  [index: string]: any;
};

export type UserDto = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
};

export type DiscussionGetDto = {
  id: number;
  settings: DiscussionSettingsGetDto;
  body: string;
  owner: UserDto;
  parentId: number;
  members: Array<MemberGetDto>;
  tags: Array<TagGetDto>;
  bannedUsers: Array<bannedUsersGetDto>;
  reactions: Array<ReactionGetDto>;
  createdAt: Date;
};

export type ResponseGetDto = {
  id: number;
  body: string;
  owner: UserDto;
  parentId: number;
  reactions: ReactionGetDto[];
  createdAt: Date;
};

export type InviteGetDto = {
  id: number;
  discussionId: number;
  senderUserId: number;
  senderUserName: string;
  recipientUserId: number;
  recipientUserName: string;
  message: string;
  status: string;
  createdAt: string;
  respondedAt?: string | null;
};

export enum Privacy {
  Public,
  Private,
  InviteOnly,
}

export type DiscussionSettingsGetDto = {
  id: number;
  discussionId: number;
  title: string;
  maxMembers?: number;
  privacy: Privacy;
};

export type TagGetDto = {
  id: number;
  name: string;
};

export type ResponseCreateDto = {
  body: string;
  parentId: number;
  createdByUserId: number;
  createdAt: Date;
};

export type FollowerCreateDto = {
  followerId: number;
  followingId: number;
};

export type FollowerGetDto = {
  id: number;
  followerId: number;
  followerUserName: string;
  followingId: number;
  followingUserName: string;
  followedAt: Date;
};

export type FollowingGetDto = {
  id: number;
  followingId: number;
  followingUserName: string;
  followerId: number;
  followerUserName: string;
  followedAt: Date;
};

export type MemberCreateDto = {
  userId: number;
  discussionId: number;
  role: string;
  joinedAt: Date;
};

export type MemberGetDto = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  role: Role;
  joinedAt: Date;
};

export enum Role {
  Owner,
  Admin,
  Member,
}

export type bannedUsersGetDto = {
  id: number;
  userId: number;
  userName: string;
  discussionId: number;
  reason: string;
  bannedByUserId: number;
  bannedByUserName: string;
  isPermanent: boolean;
  duration: DOMHighResTimeStamp;
  expirationDate?: Date;
  bannedAt: Date;
  isActive: boolean;
};
