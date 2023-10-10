import React, {  useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel } from "../../api/types";
import '../../styles/Tab_channels.css';
import ChatService from '../../api/chat-api';
import UserService from '../../api/users-api';
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useSocket, useAuth } from '../../hooks';
import { sendInviteToUser, sendNotificationToServer } from "../..//sockets/sockets";
import { toast } from 'react-hot-toast';
import { ChanMode } from '../../shared/types';

function getTimeSinceLastMsg(lastMessageDate: Date) {
  const date = (lastMessageDate instanceof Date) ? lastMessageDate : new Date(lastMessageDate);
  const formatter = new Intl.RelativeTimeFormat('en');
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (const key in ranges) {
    if (ranges[key as keyof typeof ranges] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key as keyof typeof ranges];
      return formatter.format(Math.round(delta), key as keyof typeof ranges);
    }
  }
}

export default function ChannelLink({ channel }: { channel: Channel }) {

  const [convName, setConvName] = useState<string>(channel.name);
  const [openInvitePrompt, setOpenInvitePrompt] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>("");

  const socket = useSocket();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isSuccess } = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: !!auth?.accessToken ? true : false,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });

  const { data: messages, status: msgStatus } = useQuery({queryKey: ['messages', channel.id], queryFn: () => ChatService.getAllMessages(channel.id),});

  const findOrCreateConv = useMutation<Channel, Error, void>(
    () => {
        if (data) {
            return ChatService.getDMs(data.username, inviteName);
        }
        // Handle the undefined case as well. You may want to reject here.
        return Promise.reject(new Error("Data is undefined"));
    },
    {
        onSuccess: (mutationData) => {
            queryClient.invalidateQueries(['channels']);
            if (socket && mutationData) {
                sendNotificationToServer(socket, 'join lobby', mutationData?.name);
                if (inviteName !== '') {
                    const msg: string = sendInviteToUser(socket, mutationData?.name, inviteName, channel);
                if (msg)
                    createInfoMessage.mutate([mutationData?.name, msg]);
                }
            }
        },
        onError: () => { 
            toast.error("An error occurred: could be an invalid nickname (or you're blocked).");
        }
    }
);


  const createInfoMessage = useMutation({
    mutationFn: ([channel, message]: string[]) => ChatService.newMessage(channel, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => toast.error('Message not sent: retry'),
  });

  useEffect(() => {
    if (channel.mode === ChanMode.DM && data) {
      setConvName(channel.name.replace(data?.nickname, '').trim());
    }
  }, [data, channel.mode, channel.name]);
  
  if (error || msgStatus === "error") {
    return <div>Error</div>
  }
  if (isLoading || !isSuccess  || msgStatus === "loading" || msgStatus !== "success") {
    return <div>Loading...</div>
  }

  const handleInviteClick = (event: React.FormEvent) => {
    event.stopPropagation();
    setOpenInvitePrompt(!openInvitePrompt);
  }

  const handleOnChangeInvite = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setInviteName(event.target.value);
    
  }
  const handleUpdate = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    findOrCreateConv.mutate();
}

  let msgPreview : string = 'Click to see conv';
  if (messages && messages.length > 0) {
    if (data.blockedList && data.blockedList.some((user) => user.nickname === messages[messages?.length - 1].from.nickname)) {
      msgPreview = 'Message hidden (from blocked user)';
    } else  {
      msgPreview = messages[messages?.length - 1].content;
    }
    msgPreview = (msgPreview.length <= 30)? msgPreview : msgPreview.substring(0,27) + '...';
    if (data.blockedList && data.blockedList.some((user) => user.nickname === channel.joinedUsers[0].nickname)) {
      msgPreview = 'Message hidden (from blocked user)';
    }
  }
  return (
    <div>
      <div  className="channel-link-card" >
        <div className="channel-link-header">
          <div>
            <h5 className='channel-link-name'>{convName} </h5>
            <h5 className="channel-link-span">{channel.mode}</h5>
            {
              channel.mode !== 'DM' && channel.joinedUsers &&
              <h5 className='channel-link-member'>{channel.joinedUsers.length} member(s)</h5>
            }
          </div>
          {
            channel.mode !== 'DM' && 
            <FontAwesomeIcon className='channel-link-invite' title="invite" icon={faUserPlus} onClick={handleInviteClick}/>
          }
        </div>
        {
          messages.length > 0 &&
          <>
            <div className='channel-link-preview'>
              <div > 
                <h5 className="channel-link-messenger">{messages[messages.length - 1].from.nickname} : </h5> 
                <h5 className='channel-link-lastmsg'>{msgPreview}</h5>
              </div>
              <p className='channel-link-date'>{getTimeSinceLastMsg(messages[messages?.length - 1].date)}</p>
            </div>
          </>
        }
        {
          messages.length === 0 &&
          <div className="channel-link-messenger">Click to write down your first message!</div> 
        }
      </div>
      {
        openInvitePrompt === true &&
        <div className='channel-link-invite-card' onClick={(event) => event.stopPropagation()}>
          Invite someone:
          <input  type="text" 
              placeholder="User's nickname"
              onChange={handleOnChangeInvite}
          />
          <button className="text_settings_btn" onClick={handleUpdate}>
            <FontAwesomeIcon icon={faCircleCheck} className="text_checkbox"/>
          </button>
        </div>
      }
    </div>
  );
}