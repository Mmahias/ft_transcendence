
import React, { createContext} from 'react';
import { Socket } from 'socket.io-client';
import { Channel } from '../api/interfaces-api';

export const IsLoggedInContext = React.createContext<boolean>(false);

export const SocketContext = React.createContext<Socket | null>(null);

export interface ChatStatusType {
	activeTab: number;
	setActiveTab: React.Dispatch<React.SetStateAction<number>>;
	activeChan: Channel | null;
	setActiveChan: React.Dispatch<React.SetStateAction<Channel | null>>;
	isExpanded: boolean;
	setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatStatusContext: React.Context<ChatStatusType> = createContext<ChatStatusType>({
	activeTab: 0,
	setActiveTab: () => {},
	activeChan: null,
	setActiveChan: () => {},
	isExpanded: true,
	setIsExpanded: () => {}
});
