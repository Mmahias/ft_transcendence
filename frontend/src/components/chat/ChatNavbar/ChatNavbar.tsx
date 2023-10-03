import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  ButtonContainer,
  ChannelButton,
  ChannelList,
  ActiveChannel,
  GlobalStyles
} from './ChatNavbar.styles';
import CreateChannelModal from '../CreateChannelModal/CreateChannelModal';
import JoinChannelModal from '../JoinChannelModal/JoinChannelModal';
import ChatService from '../../../api/chat-api';
import { Channel } from '../../../api/types';


interface ChannelProps {
  name: string;
  onClick: () => void;
}

const Channel: React.FC<ChannelProps> = ({ name, onClick }) => (
  <li>
    <ChannelButton onClick={onClick}>{name}</ChannelButton>
  </li>
);

interface ChatNavbarProps {
  onChannelSelect: (channel: Channel) => void;
}

const ChatNavbar: React.FC<ChatNavbarProps> = ({onChannelSelect}) => {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showJoinChannel, setShowJoinChannel] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const fetchMyChannels = async () => {
    const data: Channel[] = await ChatService.getMyChannels();
    console.log(data);
    setChannels(data);
  };

  useEffect(() => {
    fetchMyChannels();
  }, []);

  return (
    <Sidebar>
      <ButtonContainer>
        <button onClick={() => setShowCreateChannel(true)}>Create Channel</button>
        <button onClick={() => setShowJoinChannel(true)}>Join Channel</button>
      </ButtonContainer>
      <ChannelList>
        <GlobalStyles>My Channels</GlobalStyles>
        {channels.map(channel => (
          <Channel
            key={channel.name}
            name={channel.name}
            onClick={() => {
              setActiveChannel(channel.name);
              onChannelSelect(channel); // <-- Pass the entire channel object
            }}
          />
        ))}
      </ChannelList>
      <CreateChannelModal 
        isOpen={showCreateChannel} 
        onClose={() => setShowCreateChannel(false)} 
        onChannelCreated={fetchMyChannels}  // Refresh channels after creation
      />
      <JoinChannelModal 
        isOpen={showJoinChannel} 
        onClose={() => setShowJoinChannel(false)} 
        onChannelJoined={fetchMyChannels}   // Refresh channels after joining
      />
    </Sidebar>
  );
}


export default ChatNavbar;
