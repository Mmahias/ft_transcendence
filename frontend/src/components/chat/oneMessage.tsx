// import '../../styles/Tab_Chat.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';
import { faGamepad, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { updateUserInChannel } from "../../api/chat-api";
import { getMe } from "../../api/users-api";
import { Channel, Message } from "../../api/interfaces-api";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SocketContext } from '../../contexts';

const getDate = (message: Message) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' } as const;
  const date = message.date;
  const formattedDate = date.toLocaleDateString('fr-FR', options);
  return formattedDate;
}

export function OneMessage({ chan, message, index, myNickname } : 
{ chan: Channel, message: Message, index: number, myNickname: string}) {

  const [isMe, setIsMe] = useState<boolean>(myNickname === message.from.nickname);
  const [displayInviteChoice, setdisplayInviteChoice] = useState<boolean>(true);
  const {data: userMe, error, isLoading, isSuccess } = useQuery({queryKey: ['user'], queryFn: getMe});
  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (userMe?.nickname === message.from.nickname) {
      setIsMe(true)
    }
  }, [userMe, message.from, setIsMe, chan])
  
  const makeUserJoinChan = useMutation({
    mutationFn: ([myId, group, action, channelId]: [number, string, string, string]) => updateUserInChannel(myId, Number(channelId), group, action),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
      toast.success('You joined the channel!')
    },
    onError: () => { toast.error(`An error occured`) }
  });

  if (error) {
    return <div>Error while sending your message. Please retry.</div>
  }
  if (isLoading || !isSuccess || userMe === undefined) {
    return <div>Fetching your message...</div>
  }

  // Invite to a game of Pong!
  const handleInvitation = () => {
    socket?.emit('invite match', message.from.nickname);
    toast.success('Invitation sent', {id: 'invite'});
  }
  socket?.on('match invitation declined', (nickname: string) => {
    toast.error(`${nickname} declined your invitation.`, {id: 'invite'});
  });

  const handleAcceptInvite = (event: React.FormEvent, channelId: string) => {
    event.preventDefault();
    if (userMe) {
      makeUserJoinChan.mutate([userMe.id, "joinedUsers", "connect", channelId]);
      setdisplayInviteChoice(false);
    }
  }

  // if it is a message from someone I blocked:
  if (userMe?.blockedList && userMe.blockedList.some((user) => user.nickname === message.from.nickname) === true) {
    return (
      <div key={index + 2} className='one__msg_role'>
        <div key={index + 1} className='one__msg_header_info'>
          <h6>{getDate(message)}</h6>
        </div>
        <p className='one_msg_announcement' key={index}>You blocked {message.from.nickname} so this message is censored.</p>
      </div>
    );}
  
  if (message.content.startsWith('#INFO# ') === true) {
    const content = message.content.replace('#INFO# ', '');
    const channelId: string = content.slice(content.lastIndexOf(' ') + 1, content.indexOf('.'));
    const censoredContent = content.replace(channelId, '');
    if (content.includes(" been invited to the channel") && isMe === true) {
      return (
        <div key={index + 2} className='one__msg_role'>
            <div key={index + 1} className='one__msg_header_info'>
              <h6>Initiated by: {message.from.nickname} on {getDate(message)}</h6>
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
              <h6>Initiated by: {message.from.nickname} on {getDate(message)}</h6>
            </div>
            <p className='one_msg_announcement' key={index}>{censoredContent}</p>
        </div>
      );
    }
  }
  return (
  <div key={index + 2} className={`${isMe === true ? 'one__msg_me' : 'one__msg'}`} >
    <div className="one__msg_avatar_container">
      <Link to={`/user/${message.from.nickname}`} >
      <img src={message.from.avatar} title="See profile" className='one__msg_avatar' alt="Avatar"/>
      </Link >
    </div>
    <div className='one__msg_info'>
      <div key={index + 1} className='one__msg_header'>
        <h4>{message.from.nickname}</h4>
        <h6>{getDate(message)}</h6>
      </div>
      <p className={`${isMe === true ? 'one__msg_content_me' : 'one__msg_content'}`} key={index}>{message.content}</p>
    </div>
    {
      isMe === false &&
      <FontAwesomeIcon className='options__icon' title="Invite to game" icon={faGamepad} onClick={handleInvitation}/>
    }
    {
      chan.type !== 'DM' && isMe === false && 
      chan.admin.filter((admin) => admin.nickname === userMe?.nickname).length === 1
      // && <AdminOptions channelName={chan.name}  userTalking={message.from}/>
    }
  </div>
  );
}