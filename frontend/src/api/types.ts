export interface User {
  id:           number;
  username:     string;
  password:     string;
  nickname:     string;
  login_42:     string;
  avatar:       string;
  email:        string;
  bio:          string;
  status:       string;
  wins:         number;
  losses:       number;
  level:        number;
  achievements: Achievement[];

  createdAt:    Date;
  updatedAt:    Date;
  ownerChans:   User[];
  adminChans:   User[];
  friends:  User[];
  friendsRequestReceived: User[];
  blockedList:  User[];
  waitingList:  User[];

  authenticationSecret?: string;
  authenticationEnabled: boolean;
}

export interface UserUpdateDto {
  nickname: string;
}

export interface Channel {
  id:          number;
  ownerId:     number;
  nbMessages:  number;
  date:        Date;
  updatedAt:   Date;
  mode:        string;
  password:    string;
  name:        string;
  owner:       User;
  adminUsers:  User[];
  joinedUsers: User[];
  bannedUsers: User[];
  kickedUsers: User[];
  mutedUsers:  User[];
  messages:    Message[];
}

export interface Message {
  id:           number;
  fromId:       number;
  fromUsername: string;
  channelId:    number;
  to:           number;
  date:         Date;
  from:         User;
  content:      string;
  channel:      Channel;
}

export interface Achievement {
  id:          number;
  title:       string;
  icon:        string;
  description: string;
  date:        Date;
  fullfilled:  boolean;
  user:        User;
  userId:      number;
}