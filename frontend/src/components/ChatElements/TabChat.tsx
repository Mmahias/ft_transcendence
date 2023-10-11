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

  const socket = useSocket();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  const socketRef = useRef(socket);

  // obligée de requery le chan pour avoir ses MàJs....
  const { data: channel } = useQuery({
    queryKey: ['channels', conv.id],
    queryFn: () => ChatService.getChannelById(conv.id)
  });

  // post a new message
  const { mutate } = useMutation({
    mutationFn: (message: string) => ChatService.newMessage(conv.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => toast.error('Message not sent: retry')
  });

  // gets all channels messages
  const { data } = useQuery({
    queryKey: ['messages', conv.id],
    queryFn: () => ChatService.getAllMessages(conv.id),
  });

  const leaveChannelRequest = useMutation({
    mutationFn: ([user, channelId]: [User, number]) => ChatService.leaveChannel(user.id, channelId),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => { toast.error(`Error : someone tried to make you quit the channel but cannot`) }
  });

  // scroll to bottom of messages when you get on chat
  useEffect(() => {
    const scroll = document.getElementById("convo__messages");
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  }, []);

  // je regarde aussi si la personne a le droit de parler ou juste d'être là
  useEffect(() => {
    if (channel) {
      if (loggedUser && channel?.mutedUsers.some((member) => member.id === loggedUser.id)) {
        setIsMuted(true);
      }
      else
      {
        setIsMuted(false);
      }
    }
  }, [channel, loggedUser]);

  useEffect(() => {
    if (channel) {
      if (loggedUser && channel.kickedUsers.some((member) => member.id === loggedUser.id)) {
        leaveChannelRequest.mutate([loggedUser, channel.id]);
        toast(`You have been kicked from this channel (${channel.name})!`, {
          icon: '👏',
        }); 
        setActiveTab(0);
        setActiveChan(null);
      }
      if (loggedUser && channel.bannedUsers.some((member) => member.id === loggedUser.id)) {
        leaveChannelRequest.mutate([loggedUser, channel.id]);
        toast(`You have been banned from this channel (${channel.name})!`, {
          icon: '👏',
        }); 
        setActiveTab(0);
        setActiveChan(null);
      }
    }
  }, [channel, leaveChannelRequest, loggedUser, setActiveChan, setActiveTab]);

  // Avec les messages récupérés avec la query, je les attribue au setteur qui servira à les afficher
  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  // Fonction pour envoyer son msg au serveur, pour être transféré aux destinataires
  const sendMessage = (message: string) => {
    const payload: string = "/msg  " + conv?.name + "  " + message;
    
    if (socketRef) {
      socketRef.current?.emit('Chat', payload);
      setInputValue('');
    }
  };

  // Si la connexion est assurée, récupère tous les messages qui nous sont envoyés
  useEffect(() => {
    socketRef.current?.on('receiveMessage', (message: Message) => {
      console.log("Received message from:", message.from, "Logged in as:", loggedUser.nickname);
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socketRef.current?.off('receiveMessage');
    };
  }, [socketRef, mutate, data]);

  // listening to socket change to limit React re renders
  useEffect(() => {
    socketRef.current = socket; // always keep the ref updated
  }, [socket]);

  // Quand on appuie sur entrée, créé un Message avec nos données et l'envoie
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>, message: string) => {
    event.preventDefault();
    if (inputValue.trim() !== '') {
        mutate(inputValue);
        sendMessage(inputValue);
    }

    setTimeout(() => {
        const scroll = document.getElementById("convo__messages");
        if (scroll) {
            console.log("Before: T", scroll.scrollTop, "H ", scroll.scrollHeight);
            scroll.scrollTop = scroll.scrollHeight;
            console.log("After: T", scroll.scrollTop, "H ", scroll.scrollHeight);
        }
    }, 100); // waits 100ms before scrolling
};

  return (
    <div className='convo__card'>
      <TabChatHeader conv={conv} />
      <div id='convo__messages'>
      {
        messages.map((message, index) => (
          <OneMessage conv={conv} message={message} myNickname={loggedUser.nickname} index={index} key={index}/>
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
            <button id="convo_send-btn" type="submit">Send</button>
          </form>
        </div>
      }
      {
        isMuted === true && 
        <div className="convo__bottom">You're not allowed to speak here! (muted)</div>
      }
  </div>
  );
}

export default TabChat
