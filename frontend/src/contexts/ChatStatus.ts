
import React, { createContext} from 'react';
import { Channel } from '../api/types';

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
