import React, { useContext, useEffect, useState } from 'react';
// import '../../styles/Tab_Chat.css';
import { ChatStatusContext, SocketContext } from '../../context/contexts';
import { Channel, Message, User } from '../../api/interfaces';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newMessage, getAllMessages, getChannelByName, leaveChannel } from '../../api/chat';
import { OneMessage } from './oneMessage';
import { TabChatHeader } from './tabChatHeader';
import toast from 'react-hot-toast';

function TabChat({ chan, loggedUser }: { chan: Channel, loggedUser: User }) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  const socket = useContext(SocketContext);
  const queryClient = useQueryClient();

  // query whole channel
  const { data: channel } = useQuery({ 
    queryKey: ['channels', chan.name], 
    queryFn: () => getChannelByName(chan.name) 
  });
  
    // query all channel's messages
    const { allMessages } = useQuery({
      queryKey: ['messages', chan.id],
      queryFn: () => getAllMessages(chan.id),
      refetchInterval: 100,
    });

  // mutation new message
  const { mutate } = useMutation({
    mutationFn: (message: string) => newMessage(chan, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels', chan.name]);
    },
    onError: () => toast.error('Error: message could not be sent')
  });

  // mutation leave channel
  const leaveChannelRequest = useMutation({
    mutationFn: ([userId, channelId]: [number, number]) => leaveChannel(userId, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels', chan.name]);
    },
    onError: () => { toast.error(`Error : user could not leave channel`) }
  });

  // hook for scrolling to the top at init
  useEffect(() => {
    const scroll = document.getElementById("channel__messages");
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  }, []);

  // hook for muted users
  useEffect(() => {
    if (channel) {
      if (loggedUser && channel.mutedUsers.some((user: User) => user.id === loggedUser.id)) {
        setIsMuted(true);
      }
      else {
        setIsMuted(false);
      }
    }
  }, [channel, loggedUser]);

  // hook for kicked/banned users
  useEffect(() => {
    if (channel) {
      if (loggedUser && channel.kickedUsers.some((user: User) => user.id === loggedUser.id)) {
        leaveChannelRequest.mutate([loggedUser, channel.id]);
        toast(`You were kicked from this channel: (${channel.name})!`, {
          icon: '👏',
        }); 
        setActiveTab(0);
        setActiveChan(null);
      }
      if (loggedUser && channel.bannedUsers.some((user: User) => user.id === loggedUser.id)) {
        leaveChannelRequest.mutate([loggedUser, channel.id]);
        toast(`You were banned from this channel: (${channel.name})!`, {
          icon: '👏',
        }); 
        setActiveTab(0);
        setActiveChan(null);
      }
    }
  }, [channel, leaveChannelRequest, loggedUser, setActiveChan, setActiveTab]);

  // hook to set all messages in our  messages state
  useEffect(() => {
    if (allMessages) {
      setMessages(allMessages);
    }
  }, [allMessages]);

  // hook to get all sent messages
  useEffect(() => {
    if (socket) {
      // listens to receiveMessage event
      socket.on('receiveMessage', (message: Message) => {
        if (allMessages) {
          setMessages([...allMessages, message]);
        }
      });
      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket, mutate, allMessages]);
  
  // send message to the channel
  const sendMessage = (message: string) => {
    const payload: string = channel?.name + "@@" + message;

    if (socket) {
      socket.emit('chat', payload);
      setInputValue('');
  }
  };

  // when press enter, creates a form with our message and sends it
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>, message:string) => {
    event.preventDefault();
    mutate(message);
    if (inputValue.trim() !== '') {
      sendMessage(inputValue);
    }
    const scroll = document.getElementById("channel__messages");
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  };

  return (
    <div className='channel__card'>
      <TabChatHeader chan={chan} />
      <div id='channel__messages'>
      {
        messages.map((message, index) => (
          <OneMessage chan={chan} message={message} myNickname={loggedUser.nickname} index={index} key={index}/>
        ))
      }
      </div>
      {
        isMuted === false &&
        <div className='channel__bottom'>
          <form id="channel__form" onSubmit={(event) => handleFormSubmit(event, inputValue)}>
            <input
              type="text"
              value={inputValue}
              className='text_input'
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Type Here"
            />
            <button id="channel_send-btn" type="submit">Send</button>
          </form>
        </div>
      }
      {
        isMuted === true && 
        <div className="channel__bottom">You're not allowed to speak here! (muted)</div>
      }
  </div>
  );
}

export default TabChat
