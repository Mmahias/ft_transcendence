export interface User {
  id:          number;
  username:    string;
  password:    string;
  nickname:    string;
  login_42:    string;
  avatar:      string;
  email:       string;
  bio:         string;
  createdAt:   Date;
  updatedAt:   Date;
  ownerChans:  User[];
  adminChans:  User[];
  friendsList: User[];
  blockedList: User[];
  waitingList: User[];

  authenticationSecret?: string;
  authenticationEnabled: boolean;
}

export interface Channel {
  id:          number;
  ownerId:     number;
  date:        Date;
  updatedAt:  Date;
  mode:        string;
  password:    string;
  name:        string;
  owner:       User;
  adminsUsers: User[];
  joinedUsers: User[];
  bannedUsers: User[];
  kickedUsers: User[];
  mutedUsers:  User[];
}

export interface Message {
  id:        number;
  channelId: number;
  fromId:    number;
  to:        number;
  date:      Date;
  from:      User;
  content:   string;
  channel:   Channel;
}