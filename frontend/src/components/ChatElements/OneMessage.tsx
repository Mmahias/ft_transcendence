import React from 'react';
import '../../styles/Tab_Chat.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import ChatService from "../../api/chat-api";
import UserService from "../../api/users-api";
import { Channel, Message } from "../../api/types";
import {AdminOptions} from './AdminOptions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket, useAuth } from '../../hooks';
import { ChanMode } from '../../shared/types';

const getDate = (message: Message) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' } as const;
  const date = (typeof message.date === 'string') ? new Date(message.date) : message.date;
  const formattedDate = date.toLocaleDateString('en-US', options);
  return formattedDate;
}

export function OneMessage({ conv, message, index, myUsername, fromUsername }: { conv: Channel, message: Message, index: number, myUsername: string, fromUsername: string }) {

  const { auth } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [displayInviteChoice, setdisplayInviteChoice] = useState<boolean>(true);
  const isMe = myUsername === fromUsername;

  // Fetch my details
  const { data: userMe, error, isLoading } = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: !!auth?.accessToken,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });

  // Mutation for joining a channel
  const makeUserJoinChan = useMutation({
    mutationFn: ([myId, group, action, channelId]: [number, string, string, string]) => ChatService.updateUserInChannel(myId, Number(channelId), group, action),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      toast.success('You joined the channel!')
    },
    onError: () => { toast.error(`An error occured`) }
  });

  // Invite to a game of Pong!
  const handleInvitation = () => {
    socket?.emit('invite match', fromUsername);
    toast.success('Invitation sent', {id: 'invite'});
  }
  
  socket?.on('match invitation declined', (username: string) => {
    toast.error(`${username} declined your invitation.`, {id: 'invite'});
  });

  const handleAcceptInvite = (event: React.FormEvent, channelId: string) => {
    event.preventDefault();
    if (userMe) {
      makeUserJoinChan.mutate([userMe.id, "joinedUsers", "connect", channelId]);
      setdisplayInviteChoice(false);
    }
  }

  if (userMe?.blockedList && userMe.blockedList.some((user) => user.username === fromUsername) === true) {
    
    return (
      <div key={index + 2} className='one__msg_role'>
        <div key={index + 1} className='one__msg_header_info'>
          <h6>{getDate(message)}</h6>
        </div>
        <p className='one_msg_announcement' key={index}>You blocked {fromUsername} so this message is censored.</p>
      </div>
    );
  }
  if (message.content.startsWith('#INFO# ') === true) {

    const content = message.content.replace('#INFO# ', '');
    const channelId = content.split(' ')[0];
    const censoredContent = content.replace(channelId, '');
    if (content.includes(" been invited to the channel") && isMe === true) {
      return (
        <div key={index + 2} className='one__msg_role'>
            <div key={index + 1} className='one__msg_header_info'>
              <h6>Initiated by: {fromUsername} on {getDate(message)}</h6>
            </div>
            <p className='one_msg_announcement' key={index}>{censoredContent}</p>
            {
              displayInviteChoice === true &&
              <div className='one_msg_invitation'>
                <FontAwesomeIcon icon={faCheck} className='one_msg_check' onClick={(e) => handleAcceptInvite(e, channelId)}/>
                <FontAwesomeIcon icon={faXmark} className='one_msg_xmark' onClick={() => setdisplayInviteChoice(false)}/>
              </div>
            }
        </div>
      );
    } else {
      return (
        <div key={index + 2} className='one__msg_role'>
            <div key={index + 1} className='one__msg_header_info'>
              <h6>Initiated by: {fromUsername} on {getDate(message)}</h6>
            </div>
            <p className='one_msg_announcement' key={index}>{censoredContent}</p>
        </div>
      );
    }
  }
  return (
  <div key={index + 2} className={`${isMe === true ? 'one__msg_me' : 'one__msg'}`} >
    <div className="one__msg_avatar_container">
      <Link to={`/user/profile/${fromUsername}`} >
      <img src={message.from.avatar} title="See profile" className='one__msg_avatar' alt="Avatar"/>
      </Link >
    </div>
    <div className='one__msg_info'>
      <div key={index + 1} className='one__msg_header'>
        <h4>{fromUsername}</h4>
        <h6>{getDate(message)}</h6>
      </div>
      <p className={`${isMe === true ? 'one__msg_content_me' : 'one__msg_content'}`} key={index}>{message.content}</p>
    </div>
    {
      isMe === false &&
      <FontAwesomeIcon className='options__icon' title="Invite to game" icon={faGamepad} onClick={handleInvitation}/>
    }
    {
      conv.mode !== ChanMode.DM && isMe === false && 
      conv.adminUsers.filter((admin) => admin.username === userMe?.username).length === 1 && 
      <AdminOptions channelId={conv.id}  userTalking={message.from}/>
    }
  </div>
  );
}