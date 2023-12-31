import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Channel } from "../../api/types";
import '../../styles/Tab_channels.css';
import ChatService from "../../api/chat-api";
import UserService from "../../api/users-api";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks';
import { toast } from 'react-hot-toast';

export default function ChannelMore({ channel }: { channel: Channel }) {

const { auth } = useAuth();

  const [convName, setConvName] = useState<string>(channel.name);
  const [askForPassword, setAskForPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
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
  
  const joinChannelRequest = useMutation({
    mutationFn: (channel: Channel) => ChatService.updateMeInChannel(channel.id, "joinedUsers", "connect"),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
      toast.success(`You joined the channel!`) 
    },
    onError: () => { toast.error('Error : cannot join channel') }
  })

  const { mutate: verifyPassword } = useMutation({
    mutationFn: async (pwd: string) => {
      const isVerified = await ChatService.verifyPasswords(channel.id, pwd);
      // console.log("verified ?", isVerified);
      if (!isVerified) {
        throw new Error("Incorrect password");
      }
    },
    onSuccess: () => {
      toast.success("Correct password!");
      joinChannelRequest.mutate(channel);
    },
    onError: () => {
      toast.error("Incorrect password!")
    }
  })
  

  useEffect(() => {
    if (channel.mode === 'DM' && data) {
      setConvName(channel.name.replace(data?.nickname, '').trim());
    }
  }, [data, channel.mode, channel.name]);

  if (error) {
    return <div>Error</div>;
  }
  if (isLoading || !isSuccess) {
    return <div>Loading...</div>;
  }

  const handleClick = (event: React.FormEvent<HTMLDivElement>, channel: Channel) => {
    event.preventDefault();
    if (channel.mode === 'PROTECTED') {
      setAskForPassword(true);
    }  else {
      joinChannelRequest.mutate(channel);
    }
  };

  const handlePasswordCheck = () => {
    if (password !== '') {
      verifyPassword(password);
      setPassword('');
    }
    setAskForPassword(false);
  }

  return (
    <div>
      <div  className="channel-link-card" onClick={(event) => handleClick(event, channel)}>
        <div className="channel-link-header">
          <div>
            <h5 className='channel-link-name'>{convName} </h5>
            <h5 className="channel-link-span">{channel.mode}</h5>
            {
              channel.mode !== 'DM' && channel.joinedUsers &&
              <h5>{channel.joinedUsers.length} member(s)</h5>
            }
          </div>
        </div>
        <div className="channel-link-messenger">Click to join this channel!</div> 
      </div>
      {
        askForPassword === true &&
        <div className='channel-link-password-card' onClick={(event) => event.stopPropagation()}>
          This channel is protected!
          <input  type="password" 
              placeholder="Please enter the password"
              onChange={(event) => setPassword(event.target.value)}
              className="text_input"
          />
          <button className="text_settings_btn" onClick={handlePasswordCheck}>
            <FontAwesomeIcon icon={faCircleCheck} className="text_checkbox"/>
          </button>
        </div>
      }
    </div>
  );
}