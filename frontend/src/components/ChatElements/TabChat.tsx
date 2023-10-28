import React, { useContext, useEffect, useState, useRef } from 'react';
import '../../styles/Tab_Chat.css';
import { ChatStatusContext } from '../../contexts';
import { useSocket } from '../../hooks';
import { Channel, Message, User } from '../../api/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ChatService from '../../api/chat-api';
import { OneMessage } from './OneMessage';
import { TabChatHeader } from './TabChatHeader';
import toast from 'react-hot-toast';

function TabChat({ conv, loggedUser }: { conv: Channel, loggedUser: User }) {
  const queryClient = useQueryClient();
  const socket = useSocket();
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [tryToKickBan, setTryToKickBan] = useState<boolean>(false);


  // Fetch channel details
  const { data: channel } = useQuery({
    queryKey: ['channelDetails', conv.id],
    queryFn: () => ChatService.getChannelById(conv.id)
  });

  // Fetch channel messages and refresh them on success
  const { data: channelMessages } = useQuery({
    queryKey: ['channelMessages', conv.id],
    queryFn: () => ChatService.getAllMessages(conv.id),
    onSuccess: (data) => {
      // console.log('{{{ data', data)
      setMessages(data);
      scrollToBottom();
      setTryToKickBan(true);
    }
  });

  // Mutation for sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (inputMessage: string) => {
      return await ChatService.newMessage(conv.id, inputMessage);
    },
    onSuccess: () => {
      const payload: string = `/msg***${conv?.id}***${inputValue}`;
      // console.log('{{{sending message', payload);
      socket?.emit('Chat', payload);
      setInputValue('');
    },
    onError: () => toast.error('Message not sent: retry')
  });

  // Mutation for leaving a channel
  const leaveChannelMutation = useMutation({
    mutationFn: ([user, channelId]: [User, number]) => ChatService.leaveChannel(user.id, channelId),
    onSuccess: () => queryClient.invalidateQueries(['channelDetails']),
    onError: () => toast.error('Error while leaving the channel.')
  });

  // On mount: join room and scroll to the bottom of messages
  // useEffect(() => {
  //   if (socketnel?.id) {
  //     SocketService.sendNotificationToServer(socket, 'joinRoom', String(channel.id));
  //     scrollToBottom();
  //   }
  // }, []);

  // Listen for new messages, refetch messages when it receives one
  useEffect(() => {
    socket?.on('newMessage', () => {
      console.log('new message received')
      queryClient.invalidateQueries(['channelMessages']);
      queryClient.invalidateQueries(['channelDetails']);
    });

    scrollToBottom();
    return () => {
      socket?.off('newMessage');
    };
  }, [socket, sendMessageMutation]);

  // Handle user muted permissions in the channel
  useEffect(() => {
    if (channel && loggedUser) {
      const userIsMuted = channel?.mutedUsers.some(user => user.id === loggedUser.id);
      setIsMuted(userIsMuted);
    }
  }, [channel]);

  useEffect(() => {
    if (channel && loggedUser && tryToKickBan) {
      const kickBanUser = (actionMessage: string) => {
        leaveChannelMutation.mutate([loggedUser, channel.id]);
        toast(actionMessage);
        setActiveTab(0);
        setActiveChan(null);
      };

      if (channel.kickedUsers.some(user => user.id === loggedUser.id)) {
        console.log("{{{kickedusers:", channel.kickedUsers.forEach(user => console.log(user.username)));
        kickBanUser(`You were kicked from ${channel.name}!`);
        ChatService.updateUserInChannel(loggedUser.id, channel.id, 'kickedUsers', 'disconnect');
      }
      else if (channel.bannedUsers.some(user => user.id === loggedUser.id)) {
        console.log("{{{bannedusers:", channel.bannedUsers.forEach(user => console.log(user.username)));
        kickBanUser(`You were banned from ${channel.name}!`);
      }
    }
  }, [channel]);
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>, message: string) => {
    event.preventDefault();
    if (inputValue.trim() !== '') {
      sendMessageMutation.mutate(inputValue);
    }
  };

  const scrollToBottom = () => {
    const messagesElement = document.getElementById("convo__messages");
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }

  return (
    <div className='convo__content_card'>
      <div className='convo__card'>
        <TabChatHeader conv={conv} />
        <div id='convo__messages'>
        {
          messages.map((message, index) => (
            <OneMessage
              conv={conv}
              message={message}
              myUsername={loggedUser.nickname}
              index={index}
              fromUsername={message.fromUsername}
              key={message.id}/>
          ))
        }
        </div>
        {
          isMuted === false &&
          <div className='convo__bottom'>
            <form id="convo__form" onSubmit={(event) => handleFormSubmit(event, inputValue)}>
              <input
                type="text"
                value={inputValue}
                className='text_input'
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Type Here"
              />
              <button id="convo_send-btn" type="submit"><svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512"><path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"/></svg></button>
            </form>
          </div>
        }
        {
          isMuted === true && 
          <div className="convo__bottom">You're not allowed to speak here! (muted)</div>
        }
      </div>
    </div>
  );
}

export default TabChat
