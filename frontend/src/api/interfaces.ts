export interface User {
  id: number;
  createdAt: Date;
  nickname: string;
  avatar: string;
  password: string;
  email: string;
  bio: string;

  ownerChans: User[];
  adminChans: User[];

  friendsList: User[];
  blockedList: User[];
  waitingList: User[];
}

export interface Channel {
  id: number;
  date: Date;
  lastUpdated: Date;
  type: string;
  password: string;
  name: string;
  owner: User;
  ownerId: number;
  admin: User[];
  joinedUsers: User[];
  bannedUsers: User[];
  kickedUsers: User[];
  mutedUsers: User[];
}

export interface Message {
	id: number;
	date: Date;
	from: User;
	fromId: number;
	to: number;
	content: string;
	channel: Channel;
	channelId: number;
}