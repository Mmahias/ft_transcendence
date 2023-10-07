import React, { useContext, useEffect, useState } from 'react';
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { setActiveTab, setActiveChan } = useContext(ChatStatusContext);
  // const { isMuted, setIsMuted, muteExpiration, setMuteExpiration } = useContext(MuteContext);
  const socket = useSocket();
  const queryClient = useQueryClient();

  // obligée de requery le chan pour avoir ses MàJs....
  const { data: channel } = useQuery({ 
    queryKey: ['channels', conv.name], 
    queryFn: () => ChatService.getChannelByName(conv.name) 
  });

  // Queries pour récupérer les messages du channel, ou pour créer un message
  const { mutate } = useMutation({
    mutationFn: (message: string) => ChatService.newMessage(conv.name, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => toast.error('Message not sent: retry')
  });
  const { data } = useQuery({
    queryKey: ['messages', conv.id],
    queryFn: () => ChatService.getAllMessages(conv.id),
    refetchInterval: 100,
  });

  const leaveChannelRequest = useMutation({
    mutationFn: ([user, channelId]: [User, number]) => ChatService.leaveChannel(user.id, channelId),
    onSuccess: () => { 
      queryClient.invalidateQueries(['channels']);
    },
    onError: () => { toast.error(`Error : someone tried to make you quit the channel but cannot`) }
  });

  // A l'arrivée sur le chat, faire défiler les messages jusqu'aux plus récents (bas de la fenêtre)
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
    
    if (socket) {
      socket.emit('Chat', payload);
      setInputValue('');
  }
  };

  // Si la connexion est assurée, récupère tous les messages qui nous sont envoyés
  useEffect(() => {
    if (socket) {
      /* Listen tous les messages de l'event receiveMessage */
      socket.on('receiveMessage', (message: Message) => {
        if (data) {
          
          setMessages([...data, message]);
        }
      });

      return () => {
      socket.off('receiveMessage');
      };
    }
  }, [socket, mutate, data]);

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
