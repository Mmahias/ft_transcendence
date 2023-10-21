import { Channel, User } from "../../api/types";
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import '../../styles/Tab_Chat.css';
import '../../styles/SearchBar.css';
import ChatService from "../../api/chat-api";
import UserService from "../../api/users-api";
import SearchBar from "../SearchBar";
import toast from 'react-hot-toast';
import { ChatStatusContext } from "../..//contexts";
import { ChannelTitle } from "./ChannelTitle";
import { ChannelType } from "./ChannelType";
import { ChanMode } from "../../shared/types";
import { useAuth } from "../../hooks";

const getDate = (channel : Channel) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric'} as const;
  const date = (typeof channel.date === 'string') ? new Date(channel.date) : channel.date;
  const formattedDate = date.toLocaleDateString('en-US', options);
  return formattedDate;
}

export function TabChatHeader({ conv }: { conv: Channel}) {

  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  
  const { data: myDetails, error, isLoading, isSuccess } = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: !!auth?.accessToken ? true : false,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });

  const convName: string = (conv.mode === ChanMode.DM && myDetails)
    ? `@${conv.name.replace(myDetails.username, '').replace('@', '').trim()}`
    : conv.name;
  
  const leaveChannelRequest = useMutation({
    mutationFn: (user: User) => ChatService.leaveChannel(user.id, conv.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success(`You left the channel!`) 
    },
    onError: () => { toast.error(`Error : cannot leave channel (tried to leave chan or group you weren't a part of)`) }
  });
  
  const handleClick = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (myDetails) {
      leaveChannelRequest.mutate(myDetails);
      setActiveTab(0);
      setActiveChan(null);
    }
  };

  const addUserToConversation = async (selectedUserID: string) => {
    try {
      await ChatService.updateUserInChannel(Number(selectedUserID), conv.id, "joinedUsers", "connect");  // Assume that 'ChatService.addUserByID' adds a user to a conversation by its ID
      toast.success(`User added to the conversation!`);
    } catch (error: any) {
      toast.error(`Failed to add user to the conversation: ${error.message}`);
    }
  };
  if (error) {
    return <div>Error</div>
  }
  if (isLoading || !isSuccess || conv === undefined || !conv) {
    return <div>Is Loading...</div>
  }


  return (
      <div className='convo__header'>
        <div className='convo__header_title'>
          <ChannelTitle conv={conv} initialName={convName} />

          {conv.mode === ChanMode.PRIVATE && myDetails && conv.ownerId === myDetails.id && (
            <SearchBar onUserClick={addUserToConversation} />
          )}

          <button id="convo__header_leave-btn" onClick={handleClick}>Leave</button>
        </div>
        <p>Channel created on {getDate(conv)}</p>
        <p>Owner is: {conv?.owner.nickname} </p>
        <ChannelType channelId={conv.id} loggedUser={myDetails} />
      </div>
    );
}