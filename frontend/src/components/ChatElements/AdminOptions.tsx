import '../../styles/Tab_Chat.css';
import React, { useEffect, useState, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faBan, faPersonWalkingArrowRight, faCommentSlash, faUserShield } from "@fortawesome/free-solid-svg-icons";
import ChatService from '../../api/chat-api';
import UserService from '../../api/users-api';
import { Channel, User } from '../../api/types';
import toast from 'react-hot-toast';
import { handleRequestFromUser } from '../../sockets/sockets';
import { useSocket, useAuth } from '../../hooks';

export function AdminOptions({ channelName, userTalking }: { channelName: string, userTalking: User}) {
  const { auth } = useAuth();
  const [enableOptions, setEnableOptions] = useState<boolean>(false);
  const [toggleDisplay, setToggleDisplay] = useState<boolean>(false);
  const userQuery = useQuery(['me'], UserService.getMe, {
    refetchOnWindowFocus: false,
    enabled: !!auth?.accessToken ? true : false,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        console.error('user not connected');
      }
    },
  });
  const socket = useSocket();
  const { data: channel }= useQuery({ 
    queryKey: ['channels', channelName], 
    queryFn: () => ChatService.getChannelByName(channelName) 
  });
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (channel) {
      const isAdmin = channel.adminUsers.filter((admin) => admin.nickname === userQuery.data?.nickname);
      const isTargetStillInChan = channel.joinedUsers.some((member) => member.nickname === userTalking.nickname);
      if (isAdmin.length > 0 && isTargetStillInChan === true) {
        setEnableOptions(true);
      }
    }
  }, [channel, channel?.adminUsers, userQuery.data, channel?.bannedUsers, channel?.kickedUsers, channel?.mutedUsers, channel?.joinedUsers, userTalking.nickname]);
  
  const addToGroup = useMutation({
    mutationFn: ([group, action, channelId]: string[]) => ChatService.updateUserInChannel(userTalking.id, Number(channelId), group, action),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => { toast.error(`Error : cannot change ${userTalking.nickname}'s role.`) }
  });

  const handleClick = () => {
    setToggleDisplay(!toggleDisplay);
  }
  const createInfoMessage = useMutation({
    mutationFn: ([channel, message]: [number, string]) => ChatService.newMessage(channel, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => toast.error('Message not sent: retry'),
  });

  const sendInfo = (group: string, action: string) => {
    if (socket) {
      const msg: string = handleRequestFromUser(socket, group, action, channelName, userTalking.nickname);
      if (channel && msg.trim())
      {
        createInfoMessage.mutate([channel.id, msg]);
      }
    }
  };

  const handleRole = (group: keyof Channel) => {
    if (channel) {
      const userInGroup: boolean = (Array.isArray(channel[group] as User[])) ?
        (channel[group] as User[]).some((member: User) => member.id === userTalking.id)
        : false;
  
      if (!userInGroup && userTalking.id !== channel.ownerId) {
        addToGroup.mutate([group, "connect", String(channel?.id)]);
        toast.success(`${userTalking.nickname}'s role has been added!`);
        sendInfo(group, "connect");        
      } else {
        if (userTalking.id !== channel.ownerId) {
          addToGroup.mutate([group, "disconnect", String(channel?.id)]);
          toast.success(`${userTalking.nickname} has been removed from this role.`);
          sendInfo(group, "disconnect");
        } else {
          toast.error(`Can't do that to ${userTalking.nickname}, as the owner of this channel!`)
        }
      }
    }
  }

  if (userQuery.error) {
    return <div>Error</div>
  }
  if (userQuery.isLoading || !userQuery.isSuccess) {
    return <div>Loading...</div>
  }
  return (
  <>
    {
      enableOptions === true &&
      <>
      <FontAwesomeIcon className='options__icon' title="Click to see more" icon={faSquarePlus} onClick={handleClick}/>
      {
        toggleDisplay === true && 
        <>
          <FontAwesomeIcon className='options__icon' title="Make admin" icon={faUserShield} onClick={() => handleRole("adminUsers")} />
          <FontAwesomeIcon className='options__icon' title="Ban" icon={faBan} onClick={() => handleRole("bannedUsers")}/>
          <FontAwesomeIcon className='options__icon' title="Kick" icon={faPersonWalkingArrowRight} onClick={() => handleRole("kickedUsers")}/>
          <FontAwesomeIcon className='options__icon' title="Mute" icon={faCommentSlash} onClick={() => handleRole("mutedUsers")}/>
        </>
      }
      </>
    }
  </>
  );
}