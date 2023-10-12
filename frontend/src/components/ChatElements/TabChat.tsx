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
import SocketService from '../../sockets/sockets';

function TabChat({ conv, loggedUser }: { conv: Channel, loggedUser: User }) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const socketRef = useRef(useSocket());

  // Fetch channel details
  const { data: channel } = useQuery({
    queryKey: ['channelDetails', conv.id],
    queryFn: () => ChatService.getChannelById(conv.id)
  });

  // Fetch channel messages
  const { data: channelMessages } = useQuery({
    queryKey: ['channelMessages', conv.id],
    queryFn: () => ChatService.getAllMessages(conv.id),
    onSuccess: (data) => {
      setMessages(data);
      scrollToBottom();
    }
  });

  // Mutation for sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (inputMessage: string) => {
      return await ChatService.newMessage(conv.id, inputMessage);
    },
    onSuccess: () => {
      sendMessage(inputValue);
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
  useEffect(() => {
    if (socketRef && channel?.id) {
      SocketService.sendNotificationToServer(socket, 'joinRoom', String(channel.id));
      scrollToBottom();
    }
  }, []);

  // Listen for new messages
  useEffect(() => {
    socketRef.current?.on('newMessage', () => {
      console.log('Received new message');
      queryClient.invalidateQueries([channelMessages, 'channelMessages']);
    });
    scrollToBottom();
    
    return () => {
      socketRef.current?.off('newMessage');
    };
  }, [socketRef, sendMessageMutation, channelMessages]);

  // Handle user permissions in the channel
  useEffect(() => {
    if (channel && loggedUser) {
      const userIsMuted = channel?.mutedUsers.some(user => user.id === loggedUser.id);
      setIsMuted(userIsMuted);

      const userActionHandler = (actionMessage: string) => {
        leaveChannelMutation.mutate([loggedUser, channel.id]);
        toast(actionMessage);
        setActiveTab(0);
        setActiveChan(null);
      };

      if (channel.kickedUsers.some(user => user.id === loggedUser.id)) {
        userActionHandler(`You have been kicked from ${channel.name}!`);
      }

      if (channel.bannedUsers.some(user => user.id === loggedUser.id)) {
        userActionHandler(`You have been banned from ${channel.name}!`);
      }
    }
  }, [channel, loggedUser, leaveChannelMutation]);

  // Update messages when channelMessages changes
  useEffect(() => {
    channelMessages && setMessages(channelMessages);
  }, [channelMessages, setMessages]);

  const sendMessage = (message: string) => {
    const payload: string = `/msg***${conv?.id}***${message}`;
    socketRef.current?.emit('Chat', payload);
    setInputValue('');
  };

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
    <div>
      <div className='convo__card'>
        <TabChatHeader conv={conv} />
        <div id='convo__messages'>
        {
          messages.map((message, index) => (
            <OneMessage conv={conv} message={message} myUsername={loggedUser.nickname}  index={index} fromUsername={message.fromUsername} key={index}/>
          ))
        }
        </div>
      </div>
      <div>
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
              <button id="convo_send-btn" type="submit">Send</button>
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
